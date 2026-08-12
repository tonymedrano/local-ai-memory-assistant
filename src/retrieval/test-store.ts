import { store } from "../memory/memory.service.js";
import { keywordIndex } from "./index/keyword.index.instance.js";

await store({
  text: "Angular uses TypeScript for frontend development",
  type: "technology",
} as any);

console.log(keywordIndex.search("Angular"));