
type Type1 = string;
type Type2 = number;
type Type3 = boolean;
type UnionType = number | string;
type ArrNumberType = number[];
type ArrStringType = string[];
type ArrUnionType = UnionType[];

interface BasicInfo {
  id: number;
  name: string;
}

type BasicInfoType = BasicInfo;
type ArrInterfaceType = BasicInfoType[];

enum EnumType1 {
  AA = 'aa',
  BB = 'bb',
  CC = 'cc',
}

enum EnumType2 {
  AA,
  BB,
  CC = 'c'
}

type StringIterType = 'a' | 'b' | number;
type MixIterType1 = 1 | true;
type MixIterType2 = 'a' | 1;
type MixIterType4 = EnumType1.AA | EnumType1.BB;

export interface SchemaInterface {
  attr0: Type1;
  attr1: Type2;
  attr2: Type3;
  attr3: UnionType;
  attr4: ArrNumberType;
  attr5: ArrStringType;
  attr6: ArrUnionType;
  attr7: BasicInfoType;
  attr8: ArrInterfaceType;

  attr9: StringIterType;
  attr10: MixIterType1;
  attr12: MixIterType2;
  attr13: MixIterType4,

  attr14: EnumType1,
  attr15: EnumType2,
}

// object only support in top level
export type PureObject = object;
