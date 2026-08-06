import { FeedbackRepository } from "./feedback.repository.js";
import { FeedbackDrivenReranker } from "./feedback-driven.reranker.js";

import { FeedbackType } from "./feedback.types.js";

import type { LTRRankingResult } from "../ranking/ltr.ranker.js";

async function main() {
  const feedbackRepository = new FeedbackRepository();

  const feedbackReranker = new FeedbackDrivenReranker(feedbackRepository);

  const now = new Date();

  const results: LTRRankingResult[] = [
    {
      result: {
        memory: {
          id: "memory-angular",
          text: "Angular framework",
          createdAt: now.toISOString(),
        },

        score: 0.8,
        source: "hybrid",

        semanticScore: 0.9,
        keywordScore: 0.8,
        graphScore: 0.5,
        diversityScore: 1,
      },

      score: 0.8,
    },

    {
      result: {
        memory: {
          id: "memory-federation",
          text: "Angular Native Federation usa sp-shell",
          createdAt: now.toISOString(),
        },

        score: 0.7,
        source: "hybrid",

        semanticScore: 0.8,
        keywordScore: 0.7,
        graphScore: 0.5,
        diversityScore: 1,
      },

      score: 0.7,
    },
  ];

  console.log("\n=== BEFORE FEEDBACK ===");

  console.table(
    results.map((item) => ({
      id: item.result.memory.id,
      score: item.score,
    })),
  );

  await feedbackRepository.save({
    query: "Angular Native Federation",

    memoryId: "memory-federation",

    type: FeedbackType.ACCEPT,

    signal: 0.25,

    features: {
      semantic: 0.8,
      bm25: 0.7,
      importance: 0.8,
      confidence: 0.8,
      freshness: 1,
      graphEvidence: 0.5,
      accessCount: 10,
      diversity: 1,
      duplicatePenalty: 0,

      feedbackScore: 0,
      retrievalFrequency: 0,
      ageScore: 1,
    },
  });

  const ranked = await feedbackReranker.rerank(
    "Angular Native Federation",
    results,
  );

  console.log("\n=== AFTER FEEDBACK ===");

  console.table(
    ranked.map((item) => ({
      id: item.result.memory.id,
      score: item.score,
      feedbackBoost: item.feedbackBoost,
    })),
  );

  const first = ranked[0].result.memory.id;

  if (first !== "memory-federation") {
    throw new Error("Feedback reranking failed: accepted memory is not first");
  }

  console.log("\n✅ FEEDBACK RERANKING OK");
}

main().catch(console.error);
