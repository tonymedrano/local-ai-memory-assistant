import { RelearningService } from "./relearning.service.js";

const service = new RelearningService();

console.log(
  JSON.stringify(
    service.evaluate("angular-uses-typescript", 0.9),

    null,

    2,
  ),
);
