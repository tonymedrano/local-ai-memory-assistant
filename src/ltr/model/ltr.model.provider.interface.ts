import type { LTRModel } from "../training/ltr.model.js";

export interface LTRModelProvider {

  getModel(): LTRModel;

}