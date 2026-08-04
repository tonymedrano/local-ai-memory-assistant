import { retrievalPipeline } from "../../core/container.js";
import { ContextBuilder } from "../context.builder.js";

import { ContextCompressor } from "./context.compressor.js";

const builder = new ContextBuilder(
  retrievalPipeline,
);
const compressor = new ContextCompressor();
const context = await builder.build("Angular TypeScript");

const result = compressor.compress(
  context.memories.map((x) => x.item),
  context.knowledge.map((x) => x.item),
  context.explanations,
);

console.log(JSON.stringify(result, null, 2));
