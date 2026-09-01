import path from "node:path";
import fs from "node:fs";
import { config } from "../../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../../persistence/json.file.js";
import { graphScopeKey, type GraphScope, type KnowledgeGraph } from "./graph.types.js";
import { resolveGraphEdgeId, resolveGraphNodeId } from "./identity/identity.resolver.js";

type Mapping = { version: 1; nodes: Record<string, GraphScope> };

function isValidScope(scope: unknown): scope is GraphScope {
  if (!scope || typeof scope !== "object") return false;
  const candidate = scope as Partial<GraphScope>;
  if (candidate.kind === "system") return true;
  return candidate.kind === "tenant"
    && typeof candidate.tenantId === "string"
    && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(candidate.tenantId);
}

export function runGraphOwnershipMigration(legacy: KnowledgeGraph, mapping: Mapping, apply = false, outputPath?: string) {
const graphs: Record<string, KnowledgeGraph> = {};
const ids = new Map<string, string>();
let unresolved = 0;
for (const node of legacy.nodes) {
  const scope = mapping.nodes[node.id];
  if (!isValidScope(scope)) { unresolved++; continue; }
  const id = resolveGraphNodeId(scope, node.label); ids.set(node.id, id);
  const key = graphScopeKey(scope); const graph = graphs[key] ?? { nodes: [], edges: [] };
  graph.nodes.push({ ...node, id, scope }); graphs[key] = graph;
}
for (const edge of legacy.edges) {
  const source = ids.get(edge.source); const target = ids.get(edge.target);
  if (!source || !target) { unresolved++; continue; }
  const scope = mapping.nodes[legacy.nodes.find((node) => node.id === edge.source)?.id ?? ""];
  const targetScope = mapping.nodes[legacy.nodes.find((node) => node.id === edge.target)?.id ?? ""];
  if (!scope || !targetScope || graphScopeKey(scope) !== graphScopeKey(targetScope)) { unresolved++; continue; }
  graphs[graphScopeKey(scope)].edges.push({ ...edge, id: resolveGraphEdgeId(scope, source, edge.relation, target), source, target, scope });
}
const migrated = {
  schemaVersion: 2,
  graphs: Object.fromEntries(Object.entries(graphs).map(([key, graph]) => [key, { scope: graph.nodes[0].scope, ...graph }])),
};
const report = { migratedNodes: Object.values(graphs).reduce((n, g) => n + g.nodes.length, 0), migratedEdges: Object.values(graphs).reduce((n, g) => n + g.edges.length, 0), unresolved, apply, alreadyMigrated: false };
if (apply) {
  if (unresolved) throw new Error(`Refusing apply with ${unresolved} unresolved records`);
  const target = outputPath ?? path.join(config.dataDir, "knowledge-graph.json");
  if (fs.existsSync(target)) {
    const active = readJsonFileSync<unknown>(target, undefined);
    if (JSON.stringify(active) === JSON.stringify(migrated)) return { ...report, alreadyMigrated: true };
    throw new Error("Refusing migration because active v2 graph already exists");
  }
  writeJsonFileAtomicSync(target, migrated);
}
return report;
}

const mappingFlag = process.argv.indexOf("--mapping"); const mappingPath = mappingFlag === -1 ? undefined : process.argv[mappingFlag + 1];
if (mappingPath) {
 const legacyPath = path.join(config.dataDir, "knowledge-graph.json.legacy-quarantine");
 const report = runGraphOwnershipMigration(readJsonFileSync<KnowledgeGraph>(legacyPath, { nodes: [], edges: [] }), readJsonFileSync<Mapping>(path.resolve(mappingPath), { version: 1, nodes: {} }), process.argv.includes("--apply"));
 console.log(JSON.stringify(report, null, 2));
}
