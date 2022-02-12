import { ExportedDeclarations, Project, SourceFile, SyntaxKind, ts, Type } from "ts-morph";

import { BuildInToObjectTypes, BuildInToStringTypes, Options, TypeKinds } from "../schema";
import { GlobalTypeCacheContent, errors } from '../schema';
import { getFiles } from "../utils/glob";

export interface PaserConfig {
  tsConfigFilePath?: string;
  sourceFiles: string[];
}

/**
 * 根据传入的配置，解析生成 fst 中间层定义
 */
export async function paserToFSTLists(options: Options) {
  const keysCacheSet = new Set<string>();

  const project = new Project({
    tsConfigFilePath: options.tsConfig,
    skipAddingFilesFromTsConfig: true,
    // hint: ref: https://github.com/dsherret/ts-morph/issues/652
    compilerOptions: {
      strictNullChecks: true
    }
  });

  let sourceFiles = await getFiles(options.sourceFiles);
  let sourceFileParsedMap = new Map<string, SourceFile>();
  let globalTypeContentLists: GlobalTypeCacheContent[] = [];

  sourceFiles.forEach(sourceFilePath => {
    let typeContentLists = parseFile(sourceFileParsedMap, project, sourceFilePath, keysCacheSet, options);
    globalTypeContentLists = globalTypeContentLists.concat(typeContentLists)
  })

  return globalTypeContentLists;
}

/**
 * 解析单个文件暴露的 schema
 */
function parseFile(sourceFileParsedMap: Map<string, SourceFile>, project: Project, fileName: string, keysCacheSet: Set<string>, options: Options) {
  if (sourceFileParsedMap.has(fileName)) {
    return;
  }

  const sourceFileParsed = project.addSourceFileAtPath(fileName); // or addSourceFileAtPathIfExists
  sourceFileParsedMap.set(fileName, sourceFileParsed);
  
  const sourceFileDiagnostics = sourceFileParsed.getPreEmitDiagnostics();

  if (sourceFileDiagnostics.length) {
    throw new Error(`sourceFileDiagnostics:${sourceFileDiagnostics.map(error => error.getMessageText())}`);
  }

  let typeContentLists: GlobalTypeCacheContent[] = [];
  let exportedDeclarations = sourceFileParsed.getExportedDeclarations()

  for(let [key, declares] of exportedDeclarations.entries()) {
    if (keysCacheSet.has(key)) {
      throw new Error(`user error: duplicate definition not supported: ${key}`);
    }
    keysCacheSet.add(key);

    let declare = declares[0];
    let typeContent = parseDeclaration(declare, key, options);
    if (typeContent) {
      typeContentLists.push(typeContent);
    }
  }

  return typeContentLists;
}

/**
 * 深层次 parseType，可能会递归
 */
function parseType(name: string, t: Type<ts.Type>): GlobalTypeCacheContent {
  let typeContent: GlobalTypeCacheContent;
  t.getFlags();
  if (BuildInToStringTypes.includes(t.getText())) {
    typeContent = {
      typeName: name,
      isEnd: true,
      typeKind: TypeKinds.string,
    }
  } else if (BuildInToObjectTypes.includes(t.getText())) {
    typeContent = {
      typeName: name,
      isEnd: true,
      typeKind: TypeKinds.object,
    }
  } else if (t.isNumber() || t.isString() || t.isBoolean()) {
    typeContent = {
      typeName: name,
      isEnd: true,
      typeKind: t.getText() as TypeKinds,
    }
  } else if (t.isArray()) {
    typeContent = {
      typeName: name,
      isEnd: false,
      typeKind: TypeKinds.array,
    }
    let arrayElementType = t.getArrayElementType();
    typeContent.arrayChild = parseType(name, arrayElementType);
    if (!typeContent.arrayChild) {
      throw new Error(errors.PARSE_NOT_SUPPORT_UNDEFINED_ARRAYCHILD(name));
    }
  } else if (t.isTuple()) {
    typeContent = {
      typeName: name,
      isEnd: false,
      typeKind: TypeKinds.tuple,
      tupleChildren: []
    }
    let tupleTypes = t.getTupleElements();
    tupleTypes.forEach(tupleType => {
      let t = parseType('', tupleType);
      if (t) typeContent.tupleChildren.push(t);
    })
  } else if (t.isUnion()) {
    typeContent = {
      typeName: name,
      isEnd: false,
      typeKind: TypeKinds.union,
      unionChildren: []
    }
    let unionTypes = t.getUnionTypes();
    unionTypes.forEach(unionType => {
      let t = parseType('', unionType);
      if (t) typeContent.unionChildren.push(t);
    })
  } else if (t.isNull()) {
    typeContent = {
      typeName: name,
      isEnd: true,
      typeKind: TypeKinds.null,
    }
  } else if (t.isStringLiteral()) {
    typeContent = {
      typeName: name,
      isEnd: true,
      typeKind: TypeKinds.stringLiteral,
      literalValue: [t.getLiteralValue()]
    }
  } else if (t.isNumberLiteral()) {
    typeContent = {
      typeName: name,
      isEnd: true,
      typeKind: TypeKinds.numberLiteral,
      literalValue: [t.getLiteralValue()]
    }
  } else if (t.isBooleanLiteral()) {
    typeContent = {
      typeName: name,
      isEnd: true,
      typeKind: TypeKinds.boolean
    }
  } else if (t.isIntersection()) {
    let intersectionTypes = t.getIntersectionTypes();
    typeContent = {
      typeName: name,
      isEnd: false,
      typeKind: TypeKinds.interface,
      interfaceChildren: [],
    }
    for(let iType of intersectionTypes) {
      let iTypeContent = parseType('', iType);
      if (iTypeContent) typeContent.interfaceChildren = [...iTypeContent.interfaceChildren, ...typeContent.interfaceChildren]
    }
  } else if (t.isEnumLiteral()) {
    throw new Error(errors.PARSE_NOT_SUPPORT_TYPES(`EnumLiteral`)); // to be supported
  } else if (t.isUndefined()) {
    // throw new Error(errors.PARSE_NOT_SUPPORT_UNDEFINED());
    return null;
  } else if (t.isInterface() || t.isClass() || t.isObject()) {
    typeContent = {
      typeName: name,
      isEnd: false,
      typeKind: TypeKinds.interface,
      interfaceChildren: [],
    }
    let tPropertys =  t.getProperties();
    if (!tPropertys.length) {
      throw new Error(errors.PARSE_NOT_SUPPORT_EMPTY_INTERFACE(t.getText()))
    }
    tPropertys.forEach(p => {
      let ttName = p.getName();
      let tt = p.getValueDeclaration().getType();
      let ttType = parseType(ttName, tt);
      if (!ttType) return;
      // @ts-ignore
      if (p.getValueDeclaration().hasQuestionToken && !p.getValueDeclaration().hasQuestionToken()) {
        ttType.required = true;
      }
      typeContent.interfaceChildren.push(ttType)
    })
  } else if (t.getText() === 'object') {
    /**
     * Hint: 
     * t.isObject() is true when type T = { ... }
     * t.getText() === 'object' when { attr: object }
     */
    throw new Error(errors.PARSE_NOT_SUPPORT_OBJECT());
  } else {
    throw new Error(errors.PARSE_NOT_SUPPORT_TYPES(t.getText()))
  }

  return typeContent;
}

function parseDeclaration(declare: ExportedDeclarations, name: string, options: Options): GlobalTypeCacheContent | null {
  let typeContent: GlobalTypeCacheContent | null = null;

  if (declare.getKind() == SyntaxKind.InterfaceDeclaration) {
    let interfaceDeclaration = declare.asKind(SyntaxKind.InterfaceDeclaration);
    let properties = interfaceDeclaration.getProperties();
    if (!properties.length) {
      throw new Error(errors.PARSE_NOT_SUPPORT_EMPTY_INTERFACE(name))
    }

    typeContent = {
      typeName: name,
      isEnd: false,
      typeKind: TypeKinds.interface,
      interfaceChildren: [],
    }
    properties.forEach(property => {
      let t = property.getType();
      let type = parseType(property.getName(), t);
      if (!type) return;
      if (!property.hasQuestionToken()) {
        type.required = true;
      }
      typeContent.interfaceChildren.push(type);
    })

    let baseDeclarations = interfaceDeclaration.getBaseDeclarations()

    for(let baseDeclaration of baseDeclarations) {
      let baseTypeContent = parseDeclaration(baseDeclaration, baseDeclaration.getName(), options);
      if (baseTypeContent.typeKind != TypeKinds.interface) {
        console.error(`interface ${name}'s base type is not interface, maybe error`)
        continue;
      }

      let typeContentChildrenNames = typeContent.interfaceChildren.map(item => item.typeName);
      // 假设出现 A 和 B 的情况：
      baseTypeContent.interfaceChildren = baseTypeContent.interfaceChildren.filter(item => {
        return !typeContentChildrenNames.includes(item.typeName);
      })
      typeContent.interfaceChildren = [...baseTypeContent.interfaceChildren, ...typeContent.interfaceChildren]
    }

  } else if (declare.getKind() == SyntaxKind.TypeAliasDeclaration) {      
    let aliasDeclare = declare.asKind(SyntaxKind.TypeAliasDeclaration);

    if (aliasDeclare.getType().getText() == 'object') {
      typeContent = {
        typeName: aliasDeclare.getName(),
        isEnd: true,
        typeKind: TypeKinds.pureObject,
      };
      // 最外层可以支持 object，这样等同于 JSON.stringify，内层不支持
    } else {
      typeContent = parseType(aliasDeclare.getName(), aliasDeclare.getType());
    }

  } else if (declare.getKind() == SyntaxKind.ClassDeclaration) {
    if (options.classOptions.ignore) {
      console.info(`skip ClassDeclaration ${declare.asKind(SyntaxKind.ClassDeclaration).getName()} because config ignore`);
      return null;
    }
    let aliasDeclare = declare.asKind(SyntaxKind.ClassDeclaration);
    typeContent = parseType(aliasDeclare.getName(), aliasDeclare.getType());
  } else {
    console.warn(`skip in top level: ${declare.getText()}`)
  }

  return typeContent;
}
