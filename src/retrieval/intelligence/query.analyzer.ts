import type { QueryProfile } from "./query.types.js";

export class QueryAnalyzer {
  private readonly knownEntities = [
    "Angular",
    "TypeScript",
    "Node.js",
    "Docker",
    "Qdrant",
    "LTR",
    "BM25",
    "RRF",
    "Knowledge Graph",
    "RetrievalPipeline",
    "Hybrid Retrieval",
    "Reranking",
  ];

  comparisonIntent!: number;

  analyze(query: string): QueryProfile {
    const normalized = query.trim();

    if (!normalized) {
      return {
        query: "",
        tokenCount: 0,
        specificity: 0,
        complexity: 0,
        semanticIntent: 0,
        keywordIntent: 0,
        relationalIntent: 0,
        temporalIntent: 0,
        hasExactTerms: false,
        hasEntities: false,
        entities: [],
        comparisonIntent: this.calculateComparisonIntent(normalized),
      };
    }

    const entities = this.extractEntities(normalized);

    return {
      query: normalized,
      tokenCount: this.countTokens(normalized),

      specificity: this.calculateSpecificity(normalized, entities),
      complexity: this.calculateComplexity(normalized),

      semanticIntent: this.calculateSemanticIntent(normalized),
      keywordIntent: this.calculateKeywordIntent(normalized),
      relationalIntent: this.calculateRelationalIntent(normalized),
      temporalIntent: this.calculateTemporalIntent(normalized),

      hasExactTerms: this.hasExactTerms(normalized),
      hasEntities: entities.length > 0,
      entities,
      comparisonIntent: this.calculateComparisonIntent(normalized),
    };
  }

  private countTokens(query: string): number {
    if (!query) {
      return 0;
    }

    return query.split(/\s+/).filter(Boolean).length;
  }

  private calculateSpecificity(query: string, entities: string[]): number {
    const tokens = this.countTokens(query);

    if (tokens === 0) {
      return 0;
    }

    let score = 0.3;

    // Más contenido léxico aumenta la especificidad.
    if (tokens >= 2) score += 0.15;
    if (tokens >= 4) score += 0.15;
    if (tokens >= 6) score += 0.1;

    // Las entidades identificables son una señal fuerte.
    if (entities.length >= 1) score += 0.15;
    if (entities.length >= 2) score += 0.1;

    // Términos exactos aumentan aún más la precisión.
    if (this.hasExactTerms(query)) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  private calculateComplexity(query: string): number {
    const tokens = this.countTokens(query);

    if (tokens === 0) {
      return 0;
    }

    let score = 0.1;

    // Longitud.
    if (tokens >= 4) score += 0.15;
    if (tokens >= 7) score += 0.15;
    if (tokens >= 10) score += 0.15;

    const lower = query.toLowerCase();

    // Preguntas.
    if (
      lower.includes("cómo") ||
      lower.includes("por qué") ||
      lower.includes("qué") ||
      lower.includes("?")
    ) {
      score += 0.15;
    }

    // Relaciones.
    if (
      lower.includes("entre ") ||
      lower.includes("relación") ||
      lower.includes("depende") ||
      lower.includes("conecta")
    ) {
      score += 0.15;
    }

    // Condiciones / comparación.
    if (
      lower.includes("compar") ||
      lower.includes("diferencia") ||
      lower.includes("mejor") ||
      lower.includes("vs")
    ) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  private calculateSemanticIntent(query: string): number {
    const lower = query.toLowerCase();

    const semanticTerms = [
      "cómo",
      "como",
      "qué",
      "que",
      "por qué",
      "porque",
      "explica",
      "explicar",
      "funciona",
      "significa",
      "entender",
      "entiendo",
      "diferencia",
      "diferencias",
      "comparar",
      "compara",
      "comparación",
      "vs",

      "how",
      "what",
      "why",
      "explain",
      "explanation",
      "works",
      "work",
      "mean",
      "means",
      "understand",
      "difference",
      "differences",
      "compare",
      "comparison",
      "versus",
    ];

    return semanticTerms.some((term) => lower.includes(term)) ? 0.9 : 0.5;
  }

  private calculateKeywordIntent(query: string): number {
    const tokens = this.countTokens(query);

    if (tokens <= 3) {
      return 0.8;
    }

    if (tokens <= 6) {
      return 0.6;
    }

    return 0.4;
  }

  private calculateRelationalIntent(query: string): number {
    const lower = query.toLowerCase();

    const comparisonIntent = this.calculateComparisonIntent(query);

    // Una comparación explícita no implica
    // necesariamente una relación del Knowledge Graph.
    if (comparisonIntent >= 0.7) {
      return 0;
    }

    const relationalTerms = [
      "relación",
      "relacionado",
      "relaciona",
      "entre",
      "conecta",
      "depende",
      "dependencia",
      "usa",
      "utiliza",
      "vinculado",
      "vínculo",
    ];

    return relationalTerms.some((term) => lower.includes(term)) ? 0.9 : 0;
  }

  private calculateTemporalIntent(query: string): number {
    const lower = query.toLowerCase();

    const temporalTerms = [
      // Spanish
      "ayer",
      "hoy",
      "mañana",
      "antes",
      "después",
      "reciente",
      "recientes",
      "último",
      "última",
      "últimos",
      "últimas",
      "decidimos",

      // English
      "yesterday",
      "today",
      "tomorrow",
      "before",
      "after",
      "recent",
      "recently",
      "latest",
      "last",
      "previous",
      "decided",
    ];

    return temporalTerms.some((term) => lower.includes(term)) ? 0.9 : 0;
  }

  private hasExactTerms(query: string): boolean {
    return /["'][^"']+["']/.test(query);
  }

  private extractEntities(query: string): string[] {
    const normalized = query.toLowerCase();

    return this.knownEntities.filter((entity) =>
      normalized.includes(entity.toLowerCase()),
    );
  }

  private calculateComparisonIntent(query: string): number {
    const lower = query.toLowerCase();

    const comparisonTerms = [
      "diferencia",
      "diferencias",
      "comparar",
      "compara",
      "comparación",
      "vs",
      "versus",
      "mejor",
      "peor",
      "frente a",
    ];

    return comparisonTerms.some((term) => lower.includes(term)) ? 0.9 : 0;
  }
}
