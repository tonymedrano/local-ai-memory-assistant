import { DiversityService } from "./diversity.service.js";
import { TextSimilarityService } from "./text-similarity.service.js";

const service = new DiversityService(new TextSimilarityService());

const results: any[] = [
  {
    memory: {
      text: "Angular Native Federation usa sp-shell",
    },
    qualityScore: {
      finalScore: 0.95,
    },
  },
  {
    memory: {
      text: "Angular Native Federation usa sp-shell en microfrontends",
    },
    qualityScore: {
      finalScore: 0.9,
    },
  },
  {
    memory: {
      text: "Qdrant almacena embeddings vectoriales",
    },
    qualityScore: {
      finalScore: 0.85,
    },
  },
];

console.log(await service.filter(results, 2));
