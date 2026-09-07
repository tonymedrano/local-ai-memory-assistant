import path from "node:path";

import { config } from "../../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../../persistence/json.file.js";
import type { KnowledgeGraph } from "./graph.types.js";
import { graphScopeKey, type GraphScope } from "./graph.types.js";
import fs from "node:fs";

interface PersistedScopedGraph { scope: GraphScope; nodes: KnowledgeGraph["nodes"]; edges: KnowledgeGraph["edges"]; }
interface PersistedGraphV2 { schemaVersion: 2; graphs: Record<string, PersistedScopedGraph>; }

export class GraphStorage {
  private readonly filePath: string;
  constructor(filePath = path.join(config.dataDir, "knowledge-graph.json")) {
    this.filePath = filePath;
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!fs.existsSync(this.filePath)) this.save({ nodes: [], edges: [] });
    else {
      const raw = readJsonFileSync<unknown>(this.filePath, undefined);
      if (raw && typeof raw === "object" && "schemaVersion" in raw && (raw as any).schemaVersion !== 2) {
        throw new Error("Unsupported graph persistence schema version");
      }
      if (!raw || typeof raw !== "object" || (raw as any).schemaVersion !== 2) {
        const quarantine = `${this.filePath}.legacy-quarantine`;
        if (!fs.existsSync(quarantine)) fs.copyFileSync(this.filePath, quarantine);
        this.save({ nodes: [], edges: [] });
        console.warn("[GraphStorage] Legacy graph quarantined; runtime starts empty");
      }
    }
  }

  load(): KnowledgeGraph {
    const persisted = readJsonFileSync<PersistedGraphV2>(this.filePath, { schemaVersion: 2, graphs: {} });
    if (persisted.schemaVersion !== 2 || !persisted.graphs) throw new Error("Invalid graph persistence schema");
    const nodes = []; const edges = [];
    for (const [key, value] of Object.entries(persisted.graphs)) {
      if (graphScopeKey(value.scope) !== key) throw new Error("Graph namespace/scope mismatch");
      for (const node of value.nodes) { if (graphScopeKey(node.scope) !== key) throw new Error("Graph node scope mismatch"); nodes.push(node); }
      for (const edge of value.edges) { if (graphScopeKey(edge.scope) !== key) throw new Error("Graph edge scope mismatch"); edges.push(edge); }
    }
    const ids = new Set(nodes.map((node) => node.id));
    if (edges.some((edge) => !ids.has(edge.source) || !ids.has(edge.target))) throw new Error("Graph edge endpoint missing");
    return { nodes, edges };
  }

  save(graph: KnowledgeGraph) {
    const graphs: Record<string, PersistedScopedGraph> = {};
    for (const node of graph.nodes) {
      const key = graphScopeKey(node.scope); const current = graphs[key] ?? { scope: node.scope, nodes: [], edges: [] };
      if (graphScopeKey(current.scope) !== key) throw new Error("Graph namespace scope mismatch");
      current.nodes.push(node); graphs[key] = current;
    }
    for (const edge of graph.edges) {
      const key = graphScopeKey(edge.scope); const current = graphs[key] ?? { scope: edge.scope, nodes: [], edges: [] };
      if (!current.nodes.some((node) => node.id === edge.source) || !current.nodes.some((node) => node.id === edge.target)) throw new Error("Graph edge endpoint missing");
      current.edges.push(edge); graphs[key] = current;
    }
    writeJsonFileAtomicSync(this.filePath, { schemaVersion: 2, graphs });
  }

  clear() {
    this.save({
      nodes: [],
      edges: [],
    });
  }
}

export const graphStorage = new GraphStorage();
