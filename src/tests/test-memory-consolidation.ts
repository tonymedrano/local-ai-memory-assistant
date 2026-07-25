import { consolidateMemory } from "../memory/memory-consolidation.service.js";

import { MemoryType } from "../memory/memory.types.js";

async function main() {
  const result = await consolidateMemory({
    text: "Usamos Qdrant como base vectorial local",

    type: MemoryType.DECISION,

    project: "memory-service",
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
