class IOBJ {
    readonly id: string;
  
    create_at: string;
}
  
export type TupleType1 = [number, IOBJ];

export type TupleType2 = [number, string, number];