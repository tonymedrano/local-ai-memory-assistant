import { createReranker } from "./reranker.factory.js";

const reranker = createReranker();

const docs = [
  { text: "Angular Material" } as any,
  { text: "Native Federation" } as any,
  { text: "TypeScript" } as any,
];

const ranked = await reranker.rerank("Angular Native Federation", docs);

console.log(ranked);
