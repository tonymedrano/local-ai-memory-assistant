import type { LTRModel } from "../training/ltr.model.js";
import type { FeedbackScope } from "../feedback/feedback.types.js";

export interface LTRModelProvider {

  getModel(scope: FeedbackScope): LTRModel;

}
