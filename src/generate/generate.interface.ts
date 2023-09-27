export interface flowPairType {
  num: number;
  title: string;
  flow: string;
}

export interface gptResType {
  word: string;
  topic: string;
  flow: flowPairType[];
}
