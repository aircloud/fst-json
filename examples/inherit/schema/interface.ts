interface Shape {     //定义接口Shape
  color: string;
}

export interface Square extends Shape {  //继承接口Shape
  sideLength: number;
}

export interface Payload {
  square: Square
}