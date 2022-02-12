class Shape {     //定义接口Shape
  color: string;
}

export class Square extends Shape {  //继承接口Shape
  sideLength: number;
}

export class Payload {
  square: Square
}