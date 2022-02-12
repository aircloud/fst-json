import * as ejs from 'ejs';

import { Options, TypeKinds } from '../schema';
import { GlobalTypeCacheContent } from '../schema';

export interface GeneratorOutputConfig {
  avoidWrittingToFile: boolean
}

export function isValidSchema (schema: any, name: string = '') {
  const validate = require('../deps/schema-validator')

  if (!validate(schema)) {
    name = name ? `"${name}"` : ``;
    const first = validate.errors[0]
    const err = new Error(`[fst-json internal error] ${name} schema is invalid: data${first.instancePath} ${first.message}`)
    throw err
  }

  return true;
}

function ifSupport(config: any) {
  if (config.type == TypeKinds.pureObject) return false;
  return true;
}

export function genFSTLists2File(fstLists: GlobalTypeCacheContent[],  options: Options, generatorConfig?: GeneratorOutputConfig) {
  let ajvConfigs = fstLists.map(fstList => {
    return genAjvConfig(fstList, true);
  })

  ajvConfigs.forEach(ajvConfig => {
    if (!ifSupport(ajvConfig)) return; // hint: maybe object, should be replace to JSON.stringify
    isValidSchema(ajvConfig);
  })

  return genTSFile(ajvConfigs, options, generatorConfig);
}

function genTSFile(ajvConfigList: any[], options: Options, generatorConfig?: GeneratorOutputConfig) {
  const fs = require('fs')
  const serialize = require('serialize-javascript');
  const path = require('path');

  let template = ejs.compile(fs.readFileSync(path.join(__dirname, '../ejs/output.ejs'), 'utf8'), {
  });

  let renderResult = template({
    configList: ajvConfigList,
    funcs: {
      serialize: serialize,
      ifSupport,
    },
    options,
    importStatement: options.target == 'commonjs' ? `const fastJson = require('fast-json-stringify');` : `import fastJson from 'fast-json-stringify'`,
    definePerfix: options.target == 'commonjs' ? `exports.` : `export const `
  });

  if (generatorConfig?.avoidWrittingToFile) {
    return renderResult;
  } else {
    fs.writeFileSync(options.distFile, renderResult);
    return renderResult;
  }
}

/**
 * 对于有 enum 的，把 enum 聚拢在一起
 * 对于没有 enum 的，如果 type 一样，把 type 去重复
 */
export function tidyAnyof(anyOfs: { type: string, enum?: any[]}[]) {
  let directResults  = [];
  let mapsWithEnums: { [key: string]: (string | number)[]} = {};
  let typeWithoutEnums: Set<string> = new Set();
  let targetTypes = ['string', 'number']; // 目前只对 string 和 number 进行规整

  for(let anyof of anyOfs) {
    if ('enum' in anyof && targetTypes.includes(anyof.type)) {
      if (anyof.type in mapsWithEnums) {
        mapsWithEnums[anyof.type] = [...mapsWithEnums[anyof.type], ...(anyof.enum || [])];
      } else {
        mapsWithEnums[anyof.type] = [...(anyof.enum || [])];
      }
      continue;
    }
    typeWithoutEnums.add(JSON.stringify(anyof));
  }
  for(let key in mapsWithEnums) {
    directResults.push({
      type: key,
      enum: mapsWithEnums[key]
    })
  }
  for(let value of typeWithoutEnums.values()) {
    directResults.push(JSON.parse(value));
  }
  return directResults;
}

function genAjvConfig(typeContent: GlobalTypeCacheContent, withTitle?: boolean) {
  let output: any = {};
  if (withTitle) {
    output.title = `${typeContent.typeName}`;
  }

  if (typeContent.typeKind === TypeKinds.interface) {
    output.type = 'object';
    output.properties = {};
    output.required = [];
    for(let child of typeContent.interfaceChildren) {
      if (child.required) {
        output.required.push(child.typeName);
      }
      output.properties[child.typeName] = genAjvConfig(child);
    }
  } else if (
    [TypeKinds.object, TypeKinds.number, TypeKinds.string, TypeKinds.boolean, TypeKinds.null].includes(typeContent.typeKind)
  ) {
    output.type = typeContent.typeKind;
  } else if (typeContent.typeKind == TypeKinds.array) {
    output.type = typeContent.typeKind,
    output.items = genAjvConfig(typeContent.arrayChild!);
  } else if (typeContent.typeKind == TypeKinds.union) {
    output.anyOf = [];
    for(let child of typeContent.unionChildren) {
      output.anyOf.push(genAjvConfig(child));
    }
    output.anyOf = tidyAnyof(output.anyOf)
    if (output.anyOf.length == 1) {
      output = Object.assign(output, output.anyOf[0]);
      delete output.anyOf;
    }
  } else if (typeContent.typeKind == TypeKinds.tuple) {
    output.type = TypeKinds.array,
    output.items = {
      anyOf: []
    }
    for(let child of typeContent.tupleChildren) {
      output.items.anyOf.push(genAjvConfig(child));
    }
    output.items.anyOf = tidyAnyof(output.items.anyOf);
    if (output.items.anyOf.length == 1) {
      output = Object.assign(output, output.items.anyOf[0]);
      delete output.items.anyOf;
    };
  } else if (typeContent.typeKind == TypeKinds.stringLiteral) {
    output.type = 'string',
    output.enum = typeContent.literalValue;
  } else if (typeContent.typeKind == TypeKinds.numberLiteral) {
    output.type = 'number',
    output.enum = typeContent.literalValue;
  } else if (typeContent.typeKind == TypeKinds.pureObject) {
    output.type = TypeKinds.pureObject;
  } else {
    // hint: booleanLiteral 会直接被转换成 boolean
    throw new Error(`not support ${typeContent.typeName}`)
  }

  return output;
}