import fs from "node:fs/promises";

export interface LoadedDocument {
  content: string;
  path: string;
  type: string;
}

export async function loadFile(filePath: string): Promise<LoadedDocument> {
  const content = await fs.readFile(filePath, "utf-8");

  return {
    content,
    path: filePath,
    type: "filesystem",
  };
}
