import { FeedbackType } from "../feedback/feedback.types.js";
import { RewardMapper } from "./reward.mapper.js";

const mapper = new RewardMapper();

console.log("\n=== REWARD MODEL ===\n");

for (const type of Object.values(FeedbackType)) {
  console.log(
    `${type.padEnd(10)} -> ${mapper.map(type).toFixed(2)}`
  );
}