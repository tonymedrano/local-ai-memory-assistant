import fs from "node:fs/promises";

export async function loadJson(path: string) {
  const raw = await fs.readFile(path, "utf8");

  const json = JSON.parse(raw);

  return {
    content: JSON.stringify(json, null, 2),
    path,
    type: "json",
  };
}
