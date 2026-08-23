import type { NodeIdentity } from "./identity.types.js";

export function canonicalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function createNodeId(label: string): string {
  return canonicalizeLabel(label).replace(/\s+/g, "-");
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
