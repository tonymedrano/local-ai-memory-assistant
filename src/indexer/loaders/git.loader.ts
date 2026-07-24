import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function loadGit(folder: string) {
  const { stdout } = await execAsync(
    `
   cd ${folder}
   git log --oneline --all
   `,
  );

  return {
    content: stdout,

    path: folder,

    type: "git",
  };
}
