import { MemoryType } from "../../memory/memory.types.js";
import type { ContextResult } from "../context.types.js";
import type { SelectorOptions } from "./selector.types.js";

export class ContextSelector {
  select(context: ContextResult, options: SelectorOptions): ContextResult {
    switch (options.intent) {
      case "decision":
        return {
          memories: context.memories.filter(
            (memory) => memory.item.type === MemoryType.DECISION,
          ),
          knowledge: context.knowledge,
          inference: [],
          explanations: [],
        };

      case "architecture":
        return {
          memories: context.memories,
          knowledge: context.knowledge,
          inference: context.inference,
          explanations: context.explanations,
        };

      case "implementation":
        return {
          memories: context.memories.filter(
            (memory) =>
              memory.item.type === "code" || memory.item.type === "solution",
          ),
          knowledge: context.knowledge,
          inference: context.inference,
          explanations: context.explanations,
        };

      case "explanation":
        return {
          memories: context.memories,
          knowledge: context.knowledge,
          inference: context.inference,
          explanations: context.explanations,
        };

      case "debug":
        return {
          memories: context.memories,
          knowledge: context.knowledge,
          inference: context.inference,
          explanations: context.explanations,
        };

      default:
        return context;
    }
  }
}
