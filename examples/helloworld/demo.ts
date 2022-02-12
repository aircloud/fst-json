import { HelloStringify } from './schema-dist';
import { Hello } from './schema/basicTypes';

let helloData: Hello = {
  attr0: "world",
  attr1: 1,
  attr2: true
}

console.log(HelloStringify(helloData));