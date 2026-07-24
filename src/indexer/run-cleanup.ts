import { cleanupProject } from "./cleanup.js";

cleanupProject(process.argv[2] ?? ".").catch((error) => {
  console.error(error);

  process.exit(1);
});
