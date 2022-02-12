// class IOBJ {
//   readonly id: string;
//   create_at: string;
// }

// export type TupleType1 = [number, IOBJ];

// export type TupleType2 = [number, string, number];

// export interface OverView {
  // [key: string]: number
// }

// export type TypeT = Record<string, number>

// export enum EType {
//   aaa = 'aaa',
//   bbb = 'bbb',
//   ccc = 'ccc',
// }

export interface ETypeInterface {
  typeA: string,
  typeB: number
}

export type EType = ETypeInterface[]
