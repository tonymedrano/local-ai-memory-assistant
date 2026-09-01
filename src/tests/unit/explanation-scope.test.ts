import assert from "node:assert/strict";
import { test } from "node:test";
import { explain } from "../../knowledge/inference/explanation.engine.js";
import { inferenceRepository } from "../../knowledge/inference/inference.repository.js";

test("explanation rejects evidence outside the caller scope", () => {
  const subject = "scope-test-subject";
  const object = "scope-test-object";
  const edgeId = "foreign-evidence-edge";
  inferenceRepository.add([{
    subject,
    subjectLabel: "Apollo",
    relation: "requires",
    object,
    objectLabel: "TypeScript",
    confidence: 1,
    source: [edgeId],
    createdAt: new Date().toISOString(),
  }]);

  const result = explain({ kind: "tenant", tenantId: "tenant-a" }, subject, "requires", object);
  assert.equal(result, null);
});
