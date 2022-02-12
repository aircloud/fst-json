# fst-json: fast-safe-typescript json stringify toolkit

[![Coverage Status](https://coveralls.io/repos/github/aircloud/fst-json/badge.svg)](https://coveralls.io/github/aircloud/fst-json)&nbsp;![Github Actions Build&Test](https://github.com/aircloud/fst-json/actions/workflows/main.yml/badge.svg)&nbsp;![npm version](https://img.shields.io/npm/v/fst-json)

[中文文档](./README.zh-cn.md)&nbsp;|&nbsp;[Basic Example](./examples/helloworld)

By reusing the Typescript schema file, automatically generate [fast-json-stringify](https://github.com/fastify/fast-json-stringify) schema.

## Background

This project relies on [fast-json-stringify](https://github.com/fastify/fast-json-stringify) supported by the [fastify](https://www.fastify.io/) framework. One of the main features of fastify is **schema based**(by using JSON Schema), which is roughly written as follows:

```
const schema = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          hello: {
            type: 'string'
          }
        }
      }
    }
  }
}
fastify
  .get('/', schema, function (req, reply) {
    reply
      .send({ hello: 'world' })
  })
```

We can see that this set of writing methods will not only bring additional learning costs, but also somewhat duplicate with Typescript definitions.

In fact, using fst-json we can automatically generate the schema required by fastify by reusing the schema we defined in Typescript, so that we do not need to maintain additional schema definitions. We can see the effect of reusing at [here](./fst-json/examples/fastify-ts).

Of course, fst-json does not rely entirely on fastify, the serialization method it generates can replace `JSON.stringify` almost everywhere, and its other advantages:

* **Field validation according to schema:** When a required attribute is missing (for example, an attribute that is not modified by the `?` modifier when defining an interface), an error will be reported directly.
* **Filter unnecessary schema fields:** For example, when Node.JS is used as the BFF layer, fields can be returned strictly according to the definition of Typescript to avoid returning unnecessary fields, thereby avoiding passing sensitive fields from upstream services.
* **Faster serialization speed: **According to the test of [fast-json-stringify](https://github.com/fastify/fast-json-stringify), it can achieve nearly 2 times serialization speed.

## Usage

1. Install fst-json globally:

```
npm i fst-json
```

2. Create a new `.fstconfig.js` in the project directory to declare the configuration. Its full configuration is as follows:

```
export interface ClassOptions {
   ignore: boolean; // whether to ignore exported class files
}

export interface Options {
   sourceFiles: string[], // The schema file list that needs to be parsed and generated, and **all** export definitions will be generated to a corresponding stringify method
   distFile: string, // path to the js or ts file generated by serialization
   tsConfig?: string; // address of ts configuration file
   target?: 'commonjs' | 'es6', // Generation specification, can be omitted, default is es6
   suffix?: 'ts' | 'js', // Generate ts or js, can be omitted, default ts
   format?: 'stringify' | 'fastify', // Environment, if it is used in fastify, you need to fill in fastify, otherwise fill in stringify
   classOptions?: ClassOptions, // Configuration for the defined class file
}
```

1. Run `fst-json gen` under the project, the stringify file will be automatically generated.

fst-json will parse and define the stringify method for all exported types by default. For example, if you define the following types:

```
export interface SchemaInterface {
  attr0: string;
  attr1: number;
  attr2: boolean;
}
```

will be generated in the distFile you define:

```
exports.SchemaInterfaceStringify = ...
```

## Precautions

* Since fst-json will generate corresponding stringily functions for all export types in the files you configure, be sure to include only the type definitions that need to be generated to prevent the generation of unrelated functions (schemas in `import` files do not matter and will not be included).
* Due to the limitation of our upstream dependency [fast-json-stringify](https://github.com/fastify/fast-json-stringify), we cannot support all typescript specifications. Currently known not supported are:
  * Can't support generics
  * May conflict if use object's toJSON
  * It doesn't support non-specific properties. In this case, the properties will not be recognized and will default to not exist. For example, the following two writing methods are not supported:
```
export intreface OverView {
  [key: string]: number
}
export type TypeT = Record<string, number>
```


This project supports most interfaces, type aliases, and class definitions. You can learn about the Typescript cases supported by this project through the examples folder.

Since this project is still under improvement, there may be some more types that should be supported. If you have any questions about the unsupported content, please file an issue.

## Security

When using this tool, it is recommended to ensure that the schema is written by the developer and not inputed by the user.

In principle, security issues can be avoided to a large extent after doing this. This part can also refer to the [advice](https://github.com/fastify/fast-json-stringify#security) of fast-json-stringify.