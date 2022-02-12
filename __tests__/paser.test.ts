import { paserToFSTLists } from '../src/pipeline/parser';
import { genFSTLists2File, isValidSchema, tidyAnyof } from '../src/pipeline/generator';
import { Options } from '../src/schema';
import fs from 'fs';

describe('important-functions', () => {
  test('tidy-any-of', () => {
    let testCase1 = [
      { type: 'number' },
      {
        type: 'object',
        properties: { id: { type: 'string' }, create_at: { type: 'string' } },
        required: [ 'id', 'create_at' ]
      }
    ];
    let testCase2 = [ { type: 'number' }, { type: 'string' }, { type: 'number' }, { type: 'string' } ];
    let testCase3 = [
      { type: 'string', enum: ['aaa', 'bbb'] },
      { type: 'number' },
      { type: 'number', enum: [1,2,3] },
      { type: 'string', enum: ['ddd'] },
      { type: 'number', enum: [4,5] },
    ];
    let result1 = tidyAnyof(testCase1);
    let result2 = tidyAnyof(testCase2);
    let result3 = tidyAnyof(testCase3);

    expect(result1.length).toBe(2);
    expect(result2.length).toBe(2);
    expect(result3.length).toBe(3);
    expect(result3[0].enum.length).toBe(3);
    expect(result3[1].enum.length).toBe(5);
  });
})

describe('basic-schema', () => {
  test('basic-types', async () => {
    const distFile = `./__tests__/output/schema-dist-basic-types.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
        "./examples/basic/schema/basicTypes.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'stringify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].interfaceChildren[0].typeKind).toBe('string');
    expect(parseResult[0].interfaceChildren[1].typeKind).toBe('number');
    expect(parseResult[0].interfaceChildren[2].typeKind).toBe('boolean');
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  })

  test('alias', async () => {
    const distFile = `./__tests__/output/schema-dist-alias.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/basic/schema/alias.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'stringify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].interfaceChildren[0].typeKind).toBe('string');
    expect(parseResult[0].interfaceChildren[1].typeKind).toBe('number');
    expect(parseResult[0].interfaceChildren[2].typeKind).toBe('boolean');

    expect(parseResult[0].interfaceChildren[3].unionChildren.length).toBe(2);
    expect(parseResult[0].interfaceChildren[3].unionChildren[0].typeKind).toBe('string');
    expect(parseResult[0].interfaceChildren[3].unionChildren[1].typeKind).toBe('number');

    expect(parseResult[0].interfaceChildren[4].typeKind).toBe('array');
    expect(parseResult[0].interfaceChildren[4].arrayChild.typeKind).toBe('number');

    expect(parseResult[0].interfaceChildren[5].typeKind).toBe('array');
    expect(parseResult[0].interfaceChildren[5].arrayChild.typeKind).toBe('string');

    expect(parseResult[0].interfaceChildren[6].typeKind).toBe('array');
    expect(parseResult[0].interfaceChildren[6].arrayChild.typeKind).toBe('union');
    expect(parseResult[0].interfaceChildren[6].arrayChild.unionChildren.length).toBe(2);
    expect(parseResult[0].interfaceChildren[6].arrayChild.unionChildren[0].typeKind).toBe('string');
    expect(parseResult[0].interfaceChildren[6].arrayChild.unionChildren[1].typeKind).toBe('number');

    expect(parseResult[0].interfaceChildren[7].typeKind).toBe('interface');
    expect(parseResult[0].interfaceChildren[7].interfaceChildren.length).toBe(2);
    expect(parseResult[0].interfaceChildren[7].interfaceChildren[0].typeKind).toBe('number');
    expect(parseResult[0].interfaceChildren[7].interfaceChildren[1].typeKind).toBe('string');

    expect(parseResult[0].interfaceChildren[8].typeKind).toBe('array');
    // expect(parseResult[0].interfaceChildren[5].arrayChild.typeKind).toBe('union');
  
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  })

  test('buildin', async () => {
    const distFile = `./__tests__/output/schema-dist-buildin.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/basic/schema/buildin.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'stringify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].interfaceChildren[0].typeKind).toBe('string');
    expect(parseResult[0].interfaceChildren[1].typeKind).toBe('string');
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  });

  test('tuple', async() => {
    const distFile = `./__tests__/output/schema-dist-tuple.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/basic/schema/tuple.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'stringify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].typeKind).toBe('tuple');
    expect(parseResult[1].typeKind).toBe('tuple');
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  });
})

describe('import test', () => {
  test('basic-import', async() => {
    const distFile = `./__tests__/output/schema-dist-import-basic.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/import/schema/schema.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'stringify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult.length).toBe(2);
    expect(parseResult[0].interfaceChildren[2].typeKind).toBe('interface');
    expect(parseResult[0].interfaceChildren[2].interfaceChildren.length).toBe(2);
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  });
})

describe('class test', () => {
  test('class-basic', async() => {
    const distFile = `./__tests__/output/schema-dist-class-basic.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/class/schema/class.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    let parseResult = await paserToFSTLists(option);
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  });
  test('class-ignore', async() => {
    const distFile = `./__tests__/output/schema-dist-class-ignore.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/class/schema/class.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: true,
      },
      "format": 'fastify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult.length).toBe(0);
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  });
})

describe('inherit test', () => {
  test('class-inherit', async() => {
    const distFile = `./__tests__/output/schema-dist-class-inherit.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/inherit/schema/class.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].interfaceChildren.length).toBe(2);
    expect(parseResult[1].interfaceChildren.length).toBe(1);
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  })
  test('interface-inherit', async() => {
    const distFile = `./__tests__/output/schema-dist-interface-inherit.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/inherit/schema/interface.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].interfaceChildren.length).toBe(2);
    expect(parseResult[1].interfaceChildren.length).toBe(1);
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  })
  test('type-inherit', async() => {
    const distFile = `./__tests__/output/schema-dist-type-inherit.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/inherit/schema/type.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].interfaceChildren.length).toBe(5);
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  })
  test('mixed-inherit', async() => {
    const distFile = `./__tests__/output/schema-dist-mixed-inherit.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./examples/inherit/schema/mixed.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].interfaceChildren.length).toBe(6);
    let genReuslt = genFSTLists2File(parseResult, option);
    const fileResult = fs.readFileSync(distFile, 'utf-8');
    expect(fileResult).toEqual(genReuslt);
  })
});

describe('not-suppport', () => {
  test('generics test', async() => {
    const distFile = `./__tests__/output/schema-dist-generics.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/generics.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    expect.assertions(1);
    try {
      let parseResult = await paserToFSTLists(option);
      genFSTLists2File(parseResult, option);
    } catch (e) {
      expect(`${e}`).toMatch(/parse error/);
    }
  });

  test('duplicate', async() => {
    const distFile = `./__tests__/output/schema-dist-duplicate.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/duplicate1.ts",
          "./__tests__/schema/not-support/duplicate2.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    expect.assertions(1);
    try {
      let parseResult = await paserToFSTLists(option);
      genFSTLists2File(parseResult, option);
    } catch (e) {
      expect(`${e}`).toMatch(/duplicate definition/);
    }
  });

  test('object', async() => {
    const distFile = `./__tests__/output/schema-dist-object.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/object.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    expect.assertions(1);
    try {
      let parseResult = await paserToFSTLists(option);
      genFSTLists2File(parseResult, option);
    } catch (e) {
      expect(`${e}`).toMatch(/object only support in top level/);
    }
  });

  test('undefined', async() => {
    const distFile = `./__tests__/output/schema-dist-undefined.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/undefined.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult[0].interfaceChildren.length).toBe(0);
    genFSTLists2File(parseResult, option);
  });

  test('undefined-in-array', async() => {
    const distFile = `./__tests__/output/schema-dist-undefined-in-array.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/undefinedInArray.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    expect.assertions(1);
    try {
      let parseResult = await paserToFSTLists(option);
      genFSTLists2File(parseResult, option);
    } catch (e) {
      expect(`${e}`).toMatch(/array child for .*? is undefined/);
    }
  });

  test('empty-enum', async () => {
    expect.assertions(1);
    try {
      isValidSchema({
        "title": "SchemaInterface",
        "type": "object",
        "properties": {
          "attr0": {
            "type": "string",
            "enum": []
          },
        }
      })
    } catch (e) {
      expect(`${e}`).toMatch(/enum must NOT have fewer than 1 items/);
    }
  })

  test('compile-error', async () => {
    const distFile = `./__tests__/output/schema-dist-compile-error.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/compileError.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    expect.assertions(1);
    try {
      let parseResult = await paserToFSTLists(option);
      genFSTLists2File(parseResult, option);
    } catch (e) {
      expect(`${e}`).toMatch(/Error: sourceFileDiagnostics/);
    }
  })

  test('empty-interface', async () => {
    const distFile = `./__tests__/output/schema-dist-empty-interface.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/emptyInterface.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    expect.assertions(1);
    try {
      let parseResult = await paserToFSTLists(option);
      genFSTLists2File(parseResult, option);
    } catch (e) {
      expect(`${e}`).toMatch(/get empty properties/);
    }
  })

  test('top-level-enum', async () => {
    const distFile = `./__tests__/output/schema-dist-top-level-enum.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/topLevelEnum.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    let parseResult = await paserToFSTLists(option);
    expect(parseResult.length).toBe(0)
  })

  test('empty-interface-child', async () => {
    const distFile = `./__tests__/output/schema-dist-empty-interface-child.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/emptyInterfaceChild.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    expect.assertions(1);
    try {
      let parseResult = await paserToFSTLists(option);
      genFSTLists2File(parseResult, option);
    } catch (e) {
      expect(`${e}`).toMatch(/get empty properties/);
    }
  })

  test('record', async () => {
    const distFile = `./__tests__/output/schema-dist-compile-record.ts`
    let option: Options = {
      "target": "es6",
      "suffix": "ts",
      "sourceFiles": [
          "./__tests__/schema/not-support/record.ts"
      ],
      "distFile": distFile,
      "classOptions": {
        ignore: false,
      },
      "format": 'fastify'
    }
    expect.assertions(1);
    try {
      let parseResult = await paserToFSTLists(option);
      genFSTLists2File(parseResult, option);
    } catch (e) {
      expect(`${e}`).toMatch(/get empty properties/);
    }
  })
});
