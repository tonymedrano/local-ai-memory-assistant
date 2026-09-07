import { InteractionLogger } from "./interaction.logger.js";
import { InteractionRepository } from "./interaction.repository.js";

const repository = new InteractionRepository();

const logger = new InteractionLogger(repository);

logger.log(
  "angular federation",
  "memory-001",
  1,
  0.94,
  "click"
);

logger.log(
  "angular federation",
  "memory-002",
  2,
  0.88,
  "impression"
);

logger.log(
  "angular federation",
  "memory-003",
  3,
  0.71,
  "favorite"
);

console.table(repository.getAll());

console.log("Events:", repository.count());