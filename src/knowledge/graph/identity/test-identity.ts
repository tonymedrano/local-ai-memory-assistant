import {
  canonicalizeLabel,
  createNodeId,
  resolveIdentity,
  sameIdentity,
} from "./identity.resolver.js";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("Testing Knowledge Graph identity...");

assert(canonicalizeLabel(" Angular ") === "angular", "trim + lowercase");

assert(
  canonicalizeLabel("Knowledge   Graph") === "knowledge graph",
  "collapse internal whitespace",
);

assert(createNodeId("Knowledge Graph") === "knowledge-graph", "stable node id");

assert(
  createNodeId("  KNOWLEDGE   GRAPH  ") === "knowledge-graph",
  "equivalent labels must produce same id",
);

assert(
  sameIdentity("Angular", " angular "),
  "equivalent labels must share identity",
);

assert(
  !sameIdentity("Angular", "TypeScript"),
  "different labels must not share identity",
);

const identity = resolveIdentity("  Knowledge   Graph  ");

assert(identity.canonicalLabel === "knowledge graph", "canonical label");

assert(identity.nodeId === "knowledge-graph", "canonical node id");

console.log("All identity tests passed.");
