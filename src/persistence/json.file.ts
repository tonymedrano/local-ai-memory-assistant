import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

function parseJson<T>(filePath: string, content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON persistence file ${filePath}: ${reason}`);
  }
}

function temporaryPath(filePath: string): string {
  return path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`);
}

export function readJsonFileSync<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  const content = fs.readFileSync(filePath, "utf8");
  return content.trim() ? parseJson<T>(filePath, content) : fallback;
}

export function writeJsonFileAtomicSync(filePath: string, value: unknown): void {
  writeTextFileAtomicSync(filePath, JSON.stringify(value, null, 2));
}

export function writeTextFileAtomicSync(filePath: string, content: string): void {
  const temporary = temporaryPath(filePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  try {
    fs.writeFileSync(temporary, content, "utf8");
    fs.renameSync(temporary, filePath);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    throw error;
  }
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(filePath, "utf8");
    return content.trim() ? parseJson<T>(filePath, content) : fallback;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeJsonFileAtomic(filePath: string, value: unknown): Promise<void> {
  await writeTextFileAtomic(filePath, JSON.stringify(value, null, 2));
}

export async function writeTextFileAtomic(filePath: string, content: string): Promise<void> {
  const temporary = temporaryPath(filePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  try {
    await writeFile(temporary, content, "utf8");
    await rename(temporary, filePath);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}
