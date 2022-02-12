type AAA = {
  attr0: string;
  attr1: number;
  attr2: boolean;
}

type BBB = AAA & {
  attr4: number;
}

export type CCC = BBB & {
  attr5: number;
}
