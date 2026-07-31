import { MockReranker } from "./reranker.service.js";

export function createReranker() {
  return new MockReranker();
}
