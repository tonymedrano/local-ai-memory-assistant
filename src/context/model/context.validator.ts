import type { ContextModel } from "./context.model.js";
import type {
  ContextEntity,
  ContextKnowledgeReference,
  ContextMemoryReference,
} from "./context.types.js";

export interface ContextValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateContext(
  context: ContextModel,
): ContextValidationResult {
  const errors: string[] = [];

  if (!context || typeof context !== "object") {
    return {
      valid: false,
      errors: ["Context must be an object"],
    };
  }

  // -------------------------------------------------------
  // Root properties
  // -------------------------------------------------------

  if (typeof context.id !== "string" || context.id.trim().length === 0) {
    errors.push("Context id must be a non-empty string");
  }

  if (typeof context.query !== "string" || context.query.trim().length === 0) {
    errors.push("Context query must be a non-empty string");
  }

  if (
    typeof context.confidence !== "number" ||
    !Number.isFinite(context.confidence) ||
    context.confidence < 0 ||
    context.confidence > 1
  ) {
    errors.push("Context confidence must be a number between 0 and 1");
  }

  if (
    typeof context.createdAt !== "string" ||
    context.createdAt.trim().length === 0
  ) {
    errors.push("Context createdAt must be a non-empty string");
  }

  // -------------------------------------------------------
  // Collections
  // -------------------------------------------------------

  if (!Array.isArray(context.entities)) {
    errors.push("Context entities must be an array");
  } else {
    context.entities.forEach((entity, index) => {
      validateEntity(entity, index, errors);
    });
  }

  if (!Array.isArray(context.topics)) {
    errors.push("Context topics must be an array");
  }

  if (!Array.isArray(context.goals)) {
    errors.push("Context goals must be an array");
  }

  if (!Array.isArray(context.constraints)) {
    errors.push("Context constraints must be an array");
  }

  if (!Array.isArray(context.memories)) {
    errors.push("Context memories must be an array");
  } else {
    context.memories.forEach((memory, index) => {
      validateMemoryReference(memory, index, errors);
    });
  }

  if (!Array.isArray(context.knowledge)) {
    errors.push("Context knowledge must be an array");
  } else {
    context.knowledge.forEach((knowledge, index) => {
      validateKnowledgeReference(knowledge, index, errors);
    });
  }

  // -------------------------------------------------------
  // Temporal context
  // -------------------------------------------------------

  if (context.temporal !== undefined) {
    if (typeof context.temporal !== "object" || context.temporal === null) {
      errors.push("Context temporal must be an object");
    } else {
      if (
        typeof context.temporal.referenceTime !== "string" ||
        context.temporal.referenceTime.trim().length === 0
      ) {
        errors.push(
          "Context temporal referenceTime must be a non-empty string",
        );
      }

      if (typeof context.temporal.isRelative !== "boolean") {
        errors.push("Context temporal isRelative must be a boolean");
      }
    }
  }

  // -------------------------------------------------------
  // Result
  // -------------------------------------------------------

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateEntity(
  entity: ContextEntity,
  index: number,
  errors: string[],
): void {
  if (!entity || typeof entity !== "object") {
    errors.push(`Context entity at index ${index} must be an object`);
    return;
  }

  if (typeof entity.id !== "string" || entity.id.trim().length === 0) {
    errors.push(`Context entity at index ${index} must have a valid id`);
  }

  if (typeof entity.label !== "string" || entity.label.trim().length === 0) {
    errors.push(`Context entity at index ${index} must have a valid label`);
  }

  if (
    typeof entity.confidence !== "number" ||
    !Number.isFinite(entity.confidence) ||
    entity.confidence < 0 ||
    entity.confidence > 1
  ) {
    errors.push(
      `Context entity at index ${index} confidence must be between 0 and 1`,
    );
  }

  if (
    entity.source !== "query" &&
    entity.source !== "memory" &&
    entity.source !== "knowledge" &&
    entity.source !== "derived-knowledge"
  ) {
    errors.push(`Context entity at index ${index} has an invalid source`);
  }
}

function validateMemoryReference(
  memory: ContextMemoryReference,
  index: number,
  errors: string[],
): void {
  if (!memory || typeof memory !== "object") {
    errors.push(`Context memory at index ${index} must be an object`);
    return;
  }

  if (typeof memory.id !== "string" || memory.id.trim().length === 0) {
    errors.push(`Context memory at index ${index} must have a valid id`);
  }

  if (
    typeof memory.relevance !== "number" ||
    !Number.isFinite(memory.relevance) ||
    memory.relevance < 0 ||
    memory.relevance > 1
  ) {
    errors.push(
      `Context memory at index ${index} relevance must be between 0 and 1`,
    );
  }
}

function validateKnowledgeReference(
  knowledge: ContextKnowledgeReference,
  index: number,
  errors: string[],
): void {
  if (!knowledge || typeof knowledge !== "object") {
    errors.push(`Context knowledge at index ${index} must be an object`);
    return;
  }

  if (typeof knowledge.id !== "string" || knowledge.id.trim().length === 0) {
    errors.push(`Context knowledge at index ${index} must have a valid id`);
  }

  if (
    typeof knowledge.relevance !== "number" ||
    !Number.isFinite(knowledge.relevance) ||
    knowledge.relevance < 0 ||
    knowledge.relevance > 1
  ) {
    errors.push(
      `Context knowledge at index ${index} relevance must be between 0 and 1`,
    );
  }
}
