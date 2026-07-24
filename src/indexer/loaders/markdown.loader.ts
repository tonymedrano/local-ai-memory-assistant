import { loadFile, type LoadedDocument } from "./filesystem.loader.js";

export async function loadMarkdown(path: string): Promise<LoadedDocument> {
  const doc = await loadFile(path);

  return {
    ...doc,
    type: "markdown",
  };
}
