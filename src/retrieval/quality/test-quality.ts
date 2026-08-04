import { QualityScoringService } from "./quality.service.js";

const service = new QualityScoringService();

const results: any[] = [
  {
    memory: {
      text: "Angular Native Federation usa sp-shell",
      confidence: 0.9,
      importance: 0.8,
      createdAt: new Date(),
    },
    score: 0.8,
    rerankScore: 0.95,
  },
];

const output = await service.score(results);

console.log(JSON.stringify(output, null, 2));
