import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createConfig } from "../../config.js";
import { FeedbackRepository } from "../../ltr/feedback/feedback.repository.js";
import { FeedbackType } from "../../ltr/feedback/feedback.types.js";
import { DEFAULT_WEIGHTS } from "../../ltr/model/default-weights.js";
import { ModelRepository } from "../../ltr/model/model.repository.js";
import {
  readJsonFile,
  readJsonFileSync,
  writeJsonFileAtomic,
  writeJsonFileAtomicSync,
  writeTextFileAtomic,
  writeTextFileAtomicSync,
} from "../../persistence/json.file.js";

test("configures a stable, overridable runtime data directory", () => {
  assert.equal(createConfig({}).dataDir, path.resolve("data"));
  assert.equal(
    createConfig({ DATA_DIR: "./runtime-data" }).dataDir,
    path.resolve("runtime-data"),
  );
  assert.throws(
    () => createConfig({ DATA_DIR: "   " }),
    /DATA_DIR must be a non-empty directory path/,
  );
});

test("writes JSON atomically and reads it back through both persistence APIs", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "memory-service-json-"));
  const filePath = path.join(directory, "state.json");
  const jsonlPath = path.join(directory, "state.jsonl");

  t.after(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  writeJsonFileAtomicSync(filePath, { version: 1 });
  await writeJsonFileAtomic(filePath, { version: 2, entries: ["persisted"] });
  writeTextFileAtomicSync(jsonlPath, '{"version":1}\n');
  await writeTextFileAtomic(jsonlPath, '{"version":2}\n');

  assert.deepEqual(readJsonFileSync(filePath, null), {
    version: 2,
    entries: ["persisted"],
  });
  assert.deepEqual(await readJsonFile(filePath, null), {
    version: 2,
    entries: ["persisted"],
  });
  assert.equal(await readFile(jsonlPath, "utf8"), '{"version":2}\n');
  assert.deepEqual(
    (await readdir(directory)).filter((entry) => entry.endsWith(".tmp")),
    [],
  );
});

test("fails clearly on corrupt persisted JSON without replacing it", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "memory-service-json-"));
  const filePath = path.join(directory, "corrupt.json");

  t.after(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  await writeFile(filePath, "{not-json", "utf8");

  assert.throws(
    () => readJsonFileSync(filePath, []),
    new RegExp(`Invalid JSON persistence file ${filePath}`),
  );
  await assert.rejects(
    readJsonFile(filePath, []),
    new RegExp(`Invalid JSON persistence file ${filePath}`),
  );
});

test("persists active LTR feedback and model state at the configured file paths", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "memory-service-json-"));
  const feedbackPath = path.join(directory, "ranking-feedback.json");
  const modelPath = path.join(directory, "ltr-model.json");

  t.after(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  const feedback = new FeedbackRepository(feedbackPath);

  await feedback.save({
    query: "persist feedback",
    memoryId: "memory-1",
    type: FeedbackType.ACCEPT,
    signal: 1,
    features: {
      semantic: 1,
      bm25: 0,
      importance: 0,
      confidence: 0,
      freshness: 0,
      graphEvidence: 0,
      accessCount: 0,
      diversity: 0,
      duplicatePenalty: 0,
    },
  });

  const reloadedFeedback = new FeedbackRepository(feedbackPath);
  const model = new ModelRepository(modelPath);

  model.save({
    version: 1,
    trainedAt: "2026-08-31T00:00:00.000Z",
    samples: 1,
    weights: DEFAULT_WEIGHTS,
  });

  assert.equal((await reloadedFeedback.findAll()).length, 1);
  assert.equal((await reloadedFeedback.findAll())[0]?.type, FeedbackType.ACCEPT);
  assert.equal(model.load()?.samples, 1);
});
