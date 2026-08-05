import { AutomaticDatasetBuilder } from "./automatic-dataset.builder.js";
import { DatasetRepository } from "./dataset.repository.js";

async function main() {
  const builder = new AutomaticDatasetBuilder();

  const generated = await builder.build();

  console.log();

  console.log("Generated samples:", generated);

  const repository = new DatasetRepository();

  console.table(
    repository.findAll().map((s) => ({
      query: s.query,
      memory: s.memoryId,
      label: s.label,
    })),
  );

  console.log();

  console.log("Dataset size:", repository.count());
}

main();
