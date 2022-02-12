type AAA = {
  attr0: string;
  attr1: number;
  attr2: boolean;
}

interface BBB extends AAA {
  attr4: number;
}

class XXX {
  attr5: number;
}

export type CCC = BBB & XXX & {
  attr6: number;
}
