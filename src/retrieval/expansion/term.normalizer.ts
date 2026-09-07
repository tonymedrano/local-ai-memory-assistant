export class TermNormalizer {
  private readonly aliases: Record<string, string> = {
    angular: "Angular",

    typescript: "TypeScript",
    "type script": "TypeScript",

    node: "Node.js",
    nodejs: "Node.js",
    "node.js": "Node.js",

    qdrant: "Qdrant",

    javascript: "JavaScript",
    js: "JavaScript",

    docker: "Docker",
  };

  normalize(term: string): string {
    const clean = this.clean(term);

    return this.aliases[clean] ?? this.capitalize(clean);
  }

  normalizeRelation(term: string): string {
    return this.clean(term);
  }

  normalizeMany(terms: string[]): string[] {
    return [...new Set(terms.map((term) => this.normalize(term)))];
  }

  private clean(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }

  private capitalize(value: string): string {
    return value
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
}
