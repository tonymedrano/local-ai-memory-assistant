import fs from "node:fs/promises";
import path from "node:path";

const EXTENSIONS = [".ts", ".js", ".md", ".json", ".dart", ".txt", ".pdf"];

const IGNORE=[
 "node_modules",
 ".git",
 "dist",
 "build",
 ".vscode"
];

export async function scanDirectory(dir: string): Promise<string[]> {
  const result: string[] = [];

  async function walk(current: string) {
    const files = await fs.readdir(current, { withFileTypes: true });

    for (const file of files) {
      if (IGNORE.includes(file.name)) continue;

      const full = path.join(current, file.name);

      if (file.isDirectory()) {
        await walk(full);
      } else if (EXTENSIONS.some((x) => file.name.endsWith(x))) {
        result.push(full);
      }
    }
  }

  await walk(dir);

  return result;
}
