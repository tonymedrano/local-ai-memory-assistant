import assert from "node:assert/strict";
import test from "node:test";

import { missingOllamaModels, ollamaModelMatches } from "../../ai/ollama.models.js";

test("matches an omitted Ollama tag only to :latest", () => {
  assert.equal(ollamaModelMatches("nomic-embed-text", "nomic-embed-text:latest"), true);
  assert.equal(ollamaModelMatches("qwen3-coder:30b", "qwen3-coder:30b"), true);
  assert.equal(ollamaModelMatches("qwen3-coder:30b", "qwen2.5:7b"), false);
  assert.equal(ollamaModelMatches("foo", "foobar:latest"), false);
  assert.equal(ollamaModelMatches("foo:custom", "foo:latest"), false);
});

test("reports missing configured models without accepting another tag", () => {
  assert.deepEqual(
    missingOllamaModels(["nomic-embed-text", "qwen3-coder:30b"], [
      { name: "nomic-embed-text:latest" },
      { model: "qwen2.5:7b" },
    ]),
    ["qwen3-coder:30b"],
  );
});
