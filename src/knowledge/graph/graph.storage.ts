import fs from "node:fs";
import path from "node:path";

import type { KnowledgeGraph } from "./graph.types.js";

const DATA_DIR = path.resolve("data");

const FILE_PATH = path.join(DATA_DIR, "knowledge-graph.json");

class GraphStorage {
  constructor() {
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, {
        recursive: true,
      });
    }

    if (!fs.existsSync(FILE_PATH)) {
      this.save({
        nodes: [],
        edges: [],
      });
    }
  }

  load(): KnowledgeGraph {
    const content = fs.readFileSync(FILE_PATH, "utf-8");

    return JSON.parse(content);
  }

  save(graph: KnowledgeGraph) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(graph, null, 2), "utf-8");
  }

  clear() {
    this.save({
      nodes: [],
      edges: [],
    });
  }
}

export const graphStorage = new GraphStorage();
