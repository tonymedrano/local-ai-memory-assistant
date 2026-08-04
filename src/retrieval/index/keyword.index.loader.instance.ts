import { memoryRepository } from "../../memory/memory.repository.instance.js";

import { keywordIndex } from "./keyword.index.instance.js";

import { KeywordIndexLoader } from "./keyword.index.loader.js";

export const keywordIndexLoader = new KeywordIndexLoader(
  memoryRepository,
  keywordIndex,
);
