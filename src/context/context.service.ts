import { ContextBuilder } from "./context.builder.js";
import { IntentDetector } from "./intent/intent.detector.js";
import { ContextSelector } from "./selector/context.selector.js";
import { ContextCompressor } from "./compression/context.compressor.js";
import { ContextPromptBuilder } from "./prompt/context.prompt.builder.js";
import type { ContextResult } from "./context.types.js";
import { retrievalPipeline } from "../core/container.js";
import { config } from "../config.js";
import { ContextExtractionOrchestrator } from "./extraction/context.extraction.orchestrator.js";
import { buildContextFromExtraction } from "./extraction/context.extraction.adapter.js";

const builder = new ContextBuilder(
  retrievalPipeline,
);
const intentDetector = new IntentDetector();
const selector = new ContextSelector();
const compressor = new ContextCompressor();
const promptBuilder = new ContextPromptBuilder();
const extractionOrchestrator = new ContextExtractionOrchestrator();

export async function buildContext(query: string) {
  /*
   * 1. Detect user intent
   */

  const intent = intentDetector.detect(query);

  /*
   * 2. Retrieve complete context
   */

  const retrievalContext = config.contextAwareRetrieval
    ? buildContextFromExtraction(query, extractionOrchestrator.extract(query))
    : undefined;

  const context: ContextResult = await builder.build(query, retrievalContext);

  /*
   * 3. Select relevant context
   */

  const selected = selector.select(context, {
    intent,
  });

  /*
   * 4. Remove noise and compress
   */

  const compressed = compressor.compress(
    selected.memories.map((item) => item.item),
    selected.knowledge.map((item) => item.item),
    selected.explanations,
  );

  console.log("[Context Intent]", intent);

  console.log("[Selected]", {
    memories: selected.memories.length,
    knowledge: selected.knowledge.length,
    inference: selected.inference.length,
    explanations: selected.explanations.length,
  });

  /*
   * 5. Build final LLM prompt
   */

  return promptBuilder.build(compressed);
}
