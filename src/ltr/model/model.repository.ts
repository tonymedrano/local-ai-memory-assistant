import fs from "node:fs";
import path from "node:path";

import { config } from "../../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../../persistence/json.file.js";
import { LinearModel } from "./linear.model.js";
import type { StoredModel, LinearWeights } from "./model.types.js";
import type { FeedbackScope } from "../feedback/feedback.types.js";

export class ModelRepository {
  constructor(
    private readonly filePath = path.join(config.dataDir, "ltr-model.json"),
  ) {}

  load(): StoredModel | null {
    return readJsonFileSync<StoredModel | null>(this.filePath, null);
  }

  loadScoped(scope: FeedbackScope): StoredModel | null {
    if (scope.kind !== "tenant") throw new Error("Learned models require tenant scope");
    const stored = readJsonFileSync<{ schemaVersion: 1; scope: FeedbackScope; model: StoredModel } | null>(this.scopedPath(scope), null);
    if (!stored) return null;
    if (stored.schemaVersion !== 1 || stored.scope.kind !== "tenant" || stored.scope.tenantId !== scope.tenantId) throw new Error("Scoped model ownership mismatch");
    return stored.model;
  }

  loadLinearModel(): LinearModel | null {
    const stored = this.load();

    if (!stored) {
      return null;
    }

    return new LinearModel(stored.weights as LinearWeights);
  }

  save(model: StoredModel): void {
    writeJsonFileAtomicSync(this.filePath, model);
  }

  saveScoped(scope: FeedbackScope, model: StoredModel): void {
    if (scope.kind !== "tenant") throw new Error("Learned models require tenant scope");
    writeJsonFileAtomicSync(this.scopedPath(scope), { schemaVersion: 1, scope, model });
  }

  exists(): boolean {
    return fs.existsSync(this.filePath);
  }

  delete(): void {
    if (this.exists()) {
      fs.unlinkSync(this.filePath);
    }
  }

  private scopedPath(scope: Extract<FeedbackScope, { kind: "tenant" }>): string {
    const encoded = Buffer.from(`tenant:${scope.tenantId}`, "utf8").toString("base64url");
    return path.join(config.dataDir, "ltr-models", `${encoded}.json`);
  }
}
