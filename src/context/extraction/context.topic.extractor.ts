import type { ContextEntity } from "../model/context.types.js";

interface TopicRule {
  topic: string;
  keywords: string[];
}

const TOPIC_RULES: TopicRule[] = [
  {
    topic: "frontend",
    keywords: [
      "angular",
      "typescript",
      "frontend",
      "front-end",
      "ui",
      "component",
      "components",
      "signals",
      "microfrontend",
      "microfrontends",
    ],
  },

  {
    topic: "backend",
    keywords: [
      "node.js",
      "node",
      "backend",
      "back-end",
      "api",
      "express",
      "fastify",
      "server",
    ],
  },

  {
    topic: "database",
    keywords: [
      "qdrant",
      "mongodb",
      "database",
      "db",
      "vector",
      "vector database",
    ],
  },

  {
    topic: "retrieval",
    keywords: [
      "retrieval",
      "bm25",
      "rrf",
      "ltr",
      "reranking",
      "reranker",
      "hybrid retrieval",
      "retrieval pipeline",
    ],
  },

  {
    topic: "knowledge",
    keywords: [
      "knowledge",
      "knowledge graph",
      "graph",
      "inference",
      "reasoning",
    ],
  },

  {
    topic: "memory",
    keywords: [
      "memory",
      "memoria",
      "context",
      "contexto",
      "consolidation",
      "consolidación",
    ],
  },

  {
    topic: "infrastructure",
    keywords: [
      "docker",
      "container",
      "containers",
      "infrastructure",
      "infraestructura",
    ],
  },

  {
    topic: "testing",
    keywords: [
      "test",
      "tests",
      "testing",
      "testear",
      "testing",
      "validation",
      "validator",
    ],
  },

  {
    topic: "architecture",
    keywords: [
      "architecture",
      "arquitectura",
      "design",
      "diseño",
      "structure",
      "estructura",
      "service",
      "microservice",
      "microservicio",
    ],
  },

  {
    topic: "devops",
    keywords: [
      "docker",
      "deploy",
      "deployment",
      "ci",
      "cd",
      "pipeline",
      "build",
    ],
  },
];

export class ContextTopicExtractor {
  extract(query: string, entities: ContextEntity[] = []): string[] {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    const text = this.normalizeText(normalized);

    const topics = new Set<string>();

    for (const rule of TOPIC_RULES) {
      if (
        rule.keywords.some((keyword) =>
          text.includes(this.normalizeText(keyword)),
        )
      ) {
        topics.add(rule.topic);
      }
    }

    /*
     * Entities provide an additional semantic signal.
     */
    for (const entity of entities) {
      const entityText = this.normalizeText(`${entity.label} ${entity.id}`);

      for (const rule of TOPIC_RULES) {
        if (
          rule.keywords.some((keyword) =>
            entityText.includes(this.normalizeText(keyword)),
          )
        ) {
          topics.add(rule.topic);
        }
      }
    }

    return Array.from(topics);
  }

  private normalizeText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }
}
