import type { CompressedContext } from "../compression/compression.types.js";
import type { ContextPrompt } from "./context.prompt.types.js";

export class ContextPromptBuilder {
  build(context: CompressedContext): ContextPrompt {
    const sections: string[] = [];

    if (context.summary) {
      sections.push(
        `## Summary

${context.summary}`,
      );
    }

    if (context.memories.length) {
      sections.push(
        `## Memory

${context.memories.map((memory) => `- ${memory.text.trim()}`).join("\n")}`,
      );
    }

    if (context.knowledge.length) {
      sections.push(
        `## Knowledge

${context.knowledge
  .map((item) => `- ${item.subject}: ${item.content}`)
  .join("\n")}`,
      );
    }

    if (context.derived.length) {
      sections.push(
        `## Derived knowledge

${context.derived.map((item) => `- ${item.conclusion}`).join("\n")}`,
      );
    }

    const content = sections.join("\n\n");

    return {
      content,
      tokenEstimate: Math.ceil(content.length / 4),
    };
  }
}
