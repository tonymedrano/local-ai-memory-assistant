import { FeedbackType } from "../feedback/feedback.types.js";
import { RewardModel } from "./reward.model.js";
import { RewardType } from "./reward.types.js";

export class RewardMapper {
  constructor(private readonly rewardModel = new RewardModel()) {}

  map(feedback: FeedbackType): number {
    switch (feedback) {
      case FeedbackType.CLICK:
        return this.rewardModel.getReward(RewardType.CLICK);

      case FeedbackType.ACCEPT:
        return this.rewardModel.getReward(RewardType.ACCEPT);

      case FeedbackType.REJECT:
        return this.rewardModel.getReward(RewardType.REJECT);

      default:
        return this.rewardModel.getReward(RewardType.IGNORE);
    }
  }
}
