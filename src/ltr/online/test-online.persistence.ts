import { ModelRepository } from "../model/model.repository.js";
import { LearningRate } from "./online.learning-rate.js";
import { OnlineOptimizer } from "./online.optimizer.js";
import { OnlineTrainer } from "./online.trainer.js";


const repository = new ModelRepository();

const learningRate =
  new LearningRate({
    initial: 0.01,
    minimum: 0.0001,
  });


const optimizer =
  new OnlineOptimizer(
    learningRate,
  );


const trainer =
  new OnlineTrainer(
    repository,
    optimizer,
  );


const features = {
  semantic: 0.92,
  bm25: 0.81,
  importance: 0.7,
  confidence: 0.8,
  freshness: 0.9,
  graphEvidence: 0.5,
  accessCount: 3,
  diversity: 0.6,
  duplicatePenalty: 0.1,
};


console.log("\n=== BEFORE ONLINE UPDATE ===");

const before =
  repository.load();

console.log(before);



console.log("\n=== ONLINE TRAINING ===");


const updated =
  await trainer.train(
    features,
    1,
  );


console.log(updated);



console.log("\n=== SIMULATED RESTART ===");


const repositoryAfterRestart =
  new ModelRepository();


const restored =
  repositoryAfterRestart.load();


console.log(restored);



console.log("\n=== RESULT ===");


console.log(
  JSON.stringify(updated) ===
  JSON.stringify(restored)
    ? "✅ ONLINE MODEL PERSISTENCE OK"
    : "❌ FAILED",
);