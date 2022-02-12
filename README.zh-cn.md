# fst-json: fast-safe-typescript json stringify toolkit

[![Coverage Status](https://coveralls.io/repos/github/aircloud/fst-json/badge.svg)](https://coveralls.io/github/aircloud/fst-json)&nbsp;![Github Actions Build&Test](https://github.com/aircloud/fst-json/actions/workflows/main.yml/badge.svg)&nbsp;![npm version](https://img.shields.io/npm/v/fst-json)

[English Doc](./README.md)&nbsp;|&nbsp;[基础示例](./examples/helloworld)

你也可以通过[该文章](http://niexiaotao.cn/2022/02/11/fst-json/)来快速了解和入门。

通过复用 Typescript schema 文件，自动生成 [fast-json-stringify](https://github.com/fastify/fast-json-stringify) 的 schema 文件。

> 将 Typescript schema 定义好的上下文提供给序列化方法，本质上是通过提高信息量来减少推断消耗，同时这个过程并没有额外的开发负担。
## 背景

本项目依赖了 [fastify](https://www.fastify.io/) 框架支持的 [fast-json-stringify](https://github.com/fastify/fast-json-stringify)，由于 fastify 的主要特点之一在于 json schema，它的大致写法如下：

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

我们可以看出，这一套写法不仅会带来额外的学习成本，而且由于目前大多数项目开发都是采用 Typescript，这套定义也会和我们的 Typescript 定义有所重复。

实际上，我们可以通过复用我们在 Typescript 中定义的 schema，通过工具自动生成 fastify 需要的 schema，这样我们就无需额外维护 schema 定义了。我们可以在[这里](./examples/fastify-ts)查看复用后的效果。

当然，fst-json 并不完全依赖 fastify，它生成的序列化方法几乎可以在任何地方代替 `JSON.stringify`，它的其他优点包括：

* **根据 schema 进行字段校验：** 首先会进行 Tyepscript 语法校验，另外当缺失必须的属性（例如，当定义 interface 时没有被 `?` 修饰符修饰的属性）的时候也会直接报错。
* **过滤不需要的 schema 字段：** 例如当把 Node.JS 当作 BFF 层的时候，可以严格按照 Typescript 的定义来返回字段，避免返回不需要的字段，从而避免上游服务的敏感字段被直接透传出去。
* **更快的序列化速度：** 根据 [fast-json-stringify](https://github.com/fastify/fast-json-stringify) 的测试，能达到接近 2 倍的 JSON 序列化速度。

## 使用方式

1. 全局安装 fst-json：

```
npm i fst-json
```

2. 项目目录下新建 `.fstconfig.js`，用于声明配置，它的全部配置如下：

```
export interface ClassOptions {
  ignore: boolean; // 是否忽略导出的 class 文件
}

export interface Options {
  sourceFiles: string[], // 需要被解析生成的 schema 列表，会把所有导出定义生成对应的 stringify 方法
  distFile: string, // 序列化生成的 js 或 ts 文件的路径
  tsConfig?: string; // ts 配置文件的地址
  target?: 'commonjs' | 'es6', // 生成规范，可省略，默认 es6
  suffix?: 'ts' | 'js', // 生成 ts 或 js，可省略，默认 ts
  format?: 'stringify' | 'fastify', // 环境，如果是在 fastify 中使用需要填写 fastify，否则填写 stringify
  classOptions?: ClassOptions, // 对于定义的 class 文件的配置
}
```

1. 项目下运行 `fst-json gen`，会自动生成 stringify 文件。

fst-json 会默认针对所有的导出类型都解析并定义 stringify 方法，例如你定义了如下类型：

```
export interface SchemaInterface {
  attr0: string;
  attr1: number;
  attr2: boolean;
}
```

会在你定义的生成文件中生成：

```
exports.SchemaInterfaceStringify = ...
```

## 注意事项

* 由于 fst-json 会对你配置的文件中的所有导出类型生成对应的 stringily 函数，所以请务必只包含需要生成的类型定义，防止生成无关函数（通过 import 依赖的文件没有关系，不会被包含在内）。
* 由于我们上游依赖 [fast-json-stringify](https://github.com/fastify/fast-json-stringify) 的限制，我们并不能支持所有的 typescript 规范，目前已知不支持的是：
  * 无法支持泛型
  * 如果使用了 toJSON, 可能会有所冲突
  * 不支持在对象中指定非具体的属性，这种情况属性不会被识别到，会默认为不存在，例如下面两种写法都不被支持：
```
export intreface OverView {
  [key: string]: number
}
export type TypeT = Record<string, number>
```

本项目对大多数 interface、类型别名、class 等定义都进行了支持，你可以通过 examples 文件夹来了解本项目支持的 Typescript 案例。当然由于本项目也在完善中，以及 JSON 序列化本身的限制，可能有些应该可以支持的类型，也抛出了无法支持，如果你对于不支持的内容有所疑问，欢迎提 issue。

## 安全性

在使用本工具时，建议保证 schema 是由开发人员编写的，而不是用户输入的。

原则上这样做之后可以很大程度上规避安全问题，这部分也可以参考 fast-json-stringify 的[说明](https://github.com/fastify/fast-json-stringify#security)