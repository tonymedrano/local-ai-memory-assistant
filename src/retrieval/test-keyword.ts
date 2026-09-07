import { KeywordIndex } from "./index/keyword.index.js";

const index = new KeywordIndex();

index.add({
  id: "1",

  text: "Angular frontend framework",
} as any);

index.add({
  id: "2",

  text: "Node backend runtime",
} as any);

console.log(index.search("Angular"));
