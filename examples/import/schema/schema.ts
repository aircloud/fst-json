import { DepInfo } from "./dep";

export interface DemoContent {
  id: number,
  info: BasicInfo,
  dep: DepInfo
}

export interface BasicInfo {
  name?: string;
  address: string;
  nullType: null;
  date: Date;
}




