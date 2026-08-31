import path from "node:path";

import { config } from "../../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../../persistence/json.file.js";
import type { KnowledgeGraph } from "./graph.types.js";

const DATA_DIR = config.dataDir;

const FILE_PATH = path.join(DATA_DIR, "knowledge-graph.json");

class GraphStorage {
  constructor() {
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!readJsonFileSync<KnowledgeGraph | undefined>(FILE_PATH, undefined)) {
      this.save({
        nodes: [],
        edges: [],
      });
    }
  }

  load(): KnowledgeGraph {
    return readJsonFileSync(FILE_PATH, { nodes: [], edges: [] });
  }

  save(graph: KnowledgeGraph) {
    writeJsonFileAtomicSync(FILE_PATH, graph);
  }

  clear() {
    this.save({
      nodes: [],
      edges: [],
    });
  }
}

export const graphStorage = new GraphStorage();
