import type { ContextGoal } from "../model/context.types.js";

interface GoalPattern {
  pattern: RegExp;
  priority: number;
}

const GOAL_PATTERNS: GoalPattern[] = [
  {
    pattern: /\b(?:quiero|quiero que|necesito|necesitamos)\s+(.+)/i,
    priority: 0.95,
  },

  {
    pattern: /\b(?:para|con el objetivo de|con la finalidad de)\s+(.+)/i,
    priority: 0.85,
  },

  {
    pattern: /\b(?:mejorar|mejoremos|optimizar|optimicemos)\s+(.+)/i,
    priority: 0.9,
  },

  {
    pattern: /\b(?:implementar|implementemos|añadir|agregar|crear)\s+(.+)/i,
    priority: 0.9,
  },

  {
    pattern: /\b(?:resolver|solucionar|corregir)\s+(.+)/i,
    priority: 0.9,
  },

  {
    pattern: /\b(?:improve|optimize|implement|create|add|solve|fix)\s+(.+)/i,
    priority: 0.9,
  },

  {
    pattern: /\b(?:in order to|so that|with the goal of)\s+(.+)/i,
    priority: 0.85,
  },
];

export class ContextGoalExtractor {
  extract(query: string): ContextGoal[] {
    const normalized = this.normalize(query);

    if (!normalized) {
      return [];
    }

    for (const rule of GOAL_PATTERNS) {
      const match = normalized.match(rule.pattern);

      if (!match?.[1]) {
        continue;
      }

      const description = this.cleanDescription(match[1]);

      if (!description) {
        return [];
      }

      return [
        {
          id: this.createId(description),
          description,
          priority: rule.priority,
        },
      ];
    }

    return [];
  }

  private normalize(query: string): string {
    return query.trim().replace(/\s+/g, " ");
  }

  private cleanDescription(value: string): string {
    return value
      .trim()
      .replace(/[?.!]+$/, "")
      .replace(/\s+/g, " ");
  }

  private createId(description: string): string {
    return description
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
