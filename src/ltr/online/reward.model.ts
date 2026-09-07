import { RewardType } from "./reward.types.js";

export class RewardModel {
  private readonly rewards: Record<RewardType, number> = {
    [RewardType.CLICK]: 0.3,
    [RewardType.ACCEPT]: 1.0,
    [RewardType.REJECT]: -1.0,
    [RewardType.IGNORE]: -0.2,
  };

  getReward(type: RewardType): number {
    return this.rewards[type];
  }
}
