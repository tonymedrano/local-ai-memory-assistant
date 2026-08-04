import { DuplicateDetector } from "./duplicate.detector.js";
import { TextSimilarityService } from "../text-similarity.service.js";

const detector = new DuplicateDetector(new TextSimilarityService(), 0.85);

const results: any[] = [
  {
    memory: {
      id: "1",
      text: "Angular Native Federation usa un shell llamado sp-shell.",
    },

    rerankScore: 0.9,

    qualityScore: {
      finalScore: 0.92,
      relevance: 0.9,
      confidence: 0.8,
      importance: 0.8,
      freshness: 1,
      diversity: 1,
      redundancyPenalty: 0,
    },
  },

  {
    memory: {
      id: "2",
      text: "Angular Native Federation usa un shell llamado sp-shell.",
    },

    rerankScore: 0.88,

    qualityScore: {
      finalScore: 0.89,
      relevance: 0.88,
      confidence: 0.8,
      importance: 0.8,
      freshness: 1,
      diversity: 1,
      redundancyPenalty: 0,
    },
  },

  {
    memory: {
      id: "3",
      text: "Qdrant almacena embeddings vectoriales.",
    },

    rerankScore: 0.85,

    qualityScore: {
      finalScore: 0.85,
      relevance: 0.85,
      confidence: 0.9,
      importance: 0.9,
      freshness: 1,
      diversity: 1,
      redundancyPenalty: 0,
    },
  },
];

const output = await detector.removeDuplicates(results);

console.log(JSON.stringify(output, null, 2));
