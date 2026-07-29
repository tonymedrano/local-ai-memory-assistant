import { ContextQualityService } from "./context-quality.service.js";

const evaluator = new ContextQualityService();

const report = evaluator.evaluate(
  {
    memories: [
      {
        item: {
          id: "2b19c4a1-e9e8-419a-bbcf-3632f89e596a",
          text: "Usamos Qdrant como base vectorial local",
        },
        score: 0.9,
      },
    ],
    knowledge: [],
    inference: [],
    explanations: [],
  },
  ["2b19c4a1-e9e8-419a-bbcf-3632f89e596a"],
);

console.log(JSON.stringify(report, null, 2));
