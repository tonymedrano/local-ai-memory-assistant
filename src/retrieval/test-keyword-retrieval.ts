import { keywordIndex } from "./index/keyword.index.instance.js";

const memory = {
    id: "test-1",
    text: "Angular uses TypeScript for frontend development"
};

keywordIndex.add(memory as any);

const result = keywordIndex.search("Angular");

console.log(result);