import type { Memory } from "../memory/memory.types.js";
import { KeywordIndex } from "./index/keyword.index.js";

export class RetrievalIndexService {
  constructor(private keywordIndex: KeywordIndex) {}

  indexMemory(memory: Memory) {
    this.keywordIndex.add(memory);
  }
}
