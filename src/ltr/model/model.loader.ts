import fs from "node:fs";
import { LinearModel } from "./linear.model.js";
import type { LinearWeights } from "./model.types.js";

export function loadLTRModel(path = "data/ltr/model.json") {
  const json = fs.readFileSync(path, "utf8");

  const weights = JSON.parse(json) as LinearWeights;

  return new LinearModel(weights);
}
