
// @ts-nocheck
import { SchemaInterfaceStringify } from './schema-dist';
import type { SchemaInterface } from './schema/basicTypes';
import stringify from 'fst-stable-stringify';

interface Payload {
  id: number,
  content: SchemaInterface
}

function test() {
  let payload: Payload = {
    id: 1,
    content: {
      attr0: "attr0",
      attr1: 1,
      attr2: true
    }
  }

  let res = stringify(payload, {
    toJSONStr: function (key, value) {
      console.log('enhance toJSON, key:', key);
      if (key == 'content' && this == payload) {
        console.log('use schema interface stringify');
        return SchemaInterfaceStringify(value);
      };

      return undefined;
    }
  })

  console.info('res:', res);
}

test();