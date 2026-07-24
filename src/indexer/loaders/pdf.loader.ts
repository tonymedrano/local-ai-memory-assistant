import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export async function loadPdf(path: string) {
  const buffer = await fs.readFile(path);

  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  return {
    content: result.text,
    path,
    type: "pdf",
  };
}
