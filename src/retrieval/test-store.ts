
import { keywordIndex, store } from "../core/container.js";

await store({
  text: "Angular uses TypeScript for frontend development",
  type: "technology",
} as any);

console.log(keywordIndex.search("Angular"));