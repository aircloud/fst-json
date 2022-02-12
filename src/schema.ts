export enum TypeKinds {
  interface = 'interface',
  object = 'object',
  array = 'array',
  union = 'union',
  tuple = 'tuple',
  string = 'string',
  boolean = 'boolean',
  number = 'number',
  null = 'null',
  stringLiteral = 'stringLiteral',
  numberLiteral = 'numberLiteral',
  booleanLiteral = 'booleanLiteral',
  pureObject = 'pureObject',
}

export const BuildInToObjectTypes: string[] = [];
export const BuildInToStringTypes: string[] = ['Date', 'RegExp'];

export interface GlobalTypeCacheContent {
  typeName: string;
  isEnd: boolean;
  typeKind: TypeKinds;
  required?: boolean;
  interfaceChildren?: GlobalTypeCacheContent[],
  unionChildren?: GlobalTypeCacheContent[],
  tupleChildren?: GlobalTypeCacheContent[],
  arrayChild?: GlobalTypeCacheContent,
  literalValue?: any[],
}

export interface ClassOptions {
  ignore: boolean; // 是否忽略导出的 class 文件
}

export interface Options {
  tsConfig?: string; // ts 配置文件的地址
  sourceFiles: string[], // 需要被解析生成的 schema 列表，会把所有导出定义生成对应的 stringify 方法
  distFile: string, // 序列化生成的 js 或 ts 文件的路径
  target: 'commonjs' | 'es6', // 生成规范，可省略，默认 es6
  suffix: 'ts' | 'js', // 生成 ts 或 js，可省略，默认 ts
  format: 'stringify' | 'fastify', // 环境，如果是在 fastify 中使用需要填写 fastify，否则填写 stringify
  classOptions: ClassOptions, // 对于定义的 class 文件的配置
}

// 默认生成 es6 规范的 ts 文件，但是可以配置修改
export const DefaultTarget = 'es6';
export const DefaultSuffix = 'ts';
export const DefaultClassOptions = {
  ignore: false
};
export const DefaultFormat = 'stringify';

export namespace errors {
  export const PARSE_NOT_SUPPORT_UNDEFINED = () => `parse error: undefined is not support`;
  export const PARSE_NOT_SUPPORT_UNDEFINED_ARRAYCHILD = (name: string) => `parse error: array child for ${name} is undefined`;
  export const PARSE_NOT_SUPPORT_OBJECT = () => `parse error: object only support in top level`;
  export const PARSE_NOT_SUPPORT_TYPES = (typeName: string) => `parse error: not support type: ${typeName}`;
  export const PARSE_NOT_SUPPORT_EMPTY_INTERFACE = (typeName: string) => `parse error: parse ${typeName} but get empty properties`;
}