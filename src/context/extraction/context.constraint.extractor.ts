import type {
  ContextConstraint,
  ContextSource,
} from "../model/context.types.js";

interface ConstraintMatch {
  type: string;
  value: string;
}

export class ContextConstraintExtractor {
  extract(query: string, source: ContextSource = "query"): ContextConstraint[] {
    const normalized = this.normalize(query);

    if (!normalized) {
      return [];
    }

    const matches: ConstraintMatch[] = [];

    this.extractRestrictions(normalized, matches);
    this.extractScope(normalized, matches);
    this.extractLimits(normalized, matches);
    this.extractCompatibility(normalized, matches);
    this.extractTechnologyRequirements(normalized, matches);

    return this.deduplicate(
      matches.map((match) => ({
        type: match.type,
        value: match.value,
        source,
      })),
    );
  }

  private extractRestrictions(query: string, matches: ConstraintMatch[]): void {
    const patterns = [
      /\bsin\s+(.+?)(?:[.!?]|$)/i,
      /\bwithout\s+(.+?)(?:[.!?]|$)/i,
      /\bno\s+(.+?)(?:[.!?]|$)/i,
      /\bdo not\s+(.+?)(?:[.!?]|$)/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);

      if (match?.[1]) {
        matches.push({
          type: "restriction",
          value: this.clean(match[1]),
        });

        break;
      }
    }
  }

  private extractScope(query: string, matches: ConstraintMatch[]): void {
    const patterns = [
      /\bsolo\s+(?:para|en)\s+(.+?)(?:[.!?]|$)/i,
      /\bonly\s+(?:for|in)\s+(.+?)(?:[.!?]|$)/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);

      if (match?.[1]) {
        matches.push({
          type: "scope",
          value: this.clean(match[1]),
        });

        break;
      }
    }
  }

  private extractLimits(query: string, matches: ConstraintMatch[]): void {
    const patterns = [
      /\bmáximo\s+(\d+)\s+(.+?)(?:[.!?]|$)/i,
      /\bmínimo\s+(\d+)\s+(.+?)(?:[.!?]|$)/i,
      /\bmax(?:imum)?\s+(\d+)\s+(.+?)(?:[.!?]|$)/i,
      /\bmin(?:imum)?\s+(\d+)\s+(.+?)(?:[.!?]|$)/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);

      if (match?.[1] && match?.[2]) {
        matches.push({
          type: "limit",
          value: `${match[1]} ${this.clean(match[2])}`,
        });

        break;
      }
    }
  }

  private extractCompatibility(
    query: string,
    matches: ConstraintMatch[],
  ): void {
    const patterns = [
      /\bcompatibilidad\s+con\s+(.+)$/i,
      /\bcompatible\s+con\s+(.+)$/i,
      /\bcompatibility\s+with\s+(.+)$/i,
      /\bcompatible\s+with\s+(.+)$/i,
      /\bbackward\s+compatible\s+with\s+(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);

      if (match?.[1]) {
        matches.push({
          type: "compatibility",
          value: this.clean(match[1]),
        });

        break;
      }
    }
  }

  private extractTechnologyRequirements(
    query: string,
    matches: ConstraintMatch[],
  ): void {
    const patterns = [
      /\b(?:usa|usar|usando|use|using)\s+(.+?)(?=\s+(?:sin|without|no|do not)\b|[.!?]|$)/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);

      if (match?.[1]) {
        matches.push({
          type: "technology",
          value: this.clean(match[1]),
        });

        break;
      }
    }
  }
  private deduplicate(constraints: ContextConstraint[]): ContextConstraint[] {
    const seen = new Set<string>();

    return constraints.filter((constraint) => {
      const key = `${constraint.type}:${constraint.value.toLowerCase()}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }

  private clean(value: string): string {
    return value
      .trim()
      .replace(/[.!?]+$/, "")
      .replace(/\s+/g, " ");
  }

  private normalize(query: string): string {
    return query.trim().replace(/\s+/g, " ");
  }
}
