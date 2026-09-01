import type { NodeIdentity } from "./identity.types.js";
import { createHash } from "node:crypto";
import type { GraphScope } from "../graph.types.js";
import { graphScopeKey } from "../graph.types.js";

export function canonicalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function createNodeId(label: string): string {
  return canonicalizeLabel(label).replace(/\s+/g, "-");
}

export function resolveGraphNodeId(scope: GraphScope, label: string): string {
  const value = JSON.stringify([graphScopeKey(scope), canonicalizeLabel(label)]);
  return `graph-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

export function resolveGraphEdgeId(
  scope: GraphScope,
  source: string,
  relation: string,
  target: string,
): string {
  return `edge-${createHash("sha256").update(JSON.stringify([graphScopeKey(scope), source, relation, target])).digest("hex").slice(0, 24)}`;
}

export function resolveIdentity(label: string): NodeIdentity {
  const canonicalLabel = canonicalizeLabel(label);

  return {
    canonicalLabel,
    nodeId: createNodeId(canonicalLabel),
  };
}

export function sameIdentity(first: string, second: string): boolean {
  return canonicalizeLabel(first) === canonicalizeLabel(second);
}
