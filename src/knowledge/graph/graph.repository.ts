import type { GraphNode, GraphEdge, GraphScope, KnowledgeGraph } from "./graph.types.js";
import { graphScopeKey } from "./graph.types.js";
import { graphStorage } from "./graph.storage.js";

import { canonicalizeLabel, resolveGraphNodeId } from "./identity/identity.resolver.js";

export interface GraphStorage {
  load(): KnowledgeGraph;
  save(graph: KnowledgeGraph): void;
}

export class GraphRepository {
  private readonly scopedGraphs = new Map<string, { nodes: Map<string, GraphNode>; edges: Map<string, GraphEdge>; labels: Map<string, string> }>();
  private scoped(scope: GraphScope) {
    const key = graphScopeKey(scope);
    let state = this.scopedGraphs.get(key);
    if (!state) { state = { nodes: new Map(), edges: new Map(), labels: new Map() }; this.scopedGraphs.set(key, state); }
    return state;
  }
  private graph: KnowledgeGraph;

  constructor(private readonly storage: GraphStorage = graphStorage) {
    this.graph = storage.load();
    for (const node of this.graph.nodes) {
      const state = this.scoped(node.scope);
      state.nodes.set(node.id, node);
      state.labels.set(canonicalizeLabel(node.label), node.id);
    }
    for (const edge of this.graph.edges) this.scoped(edge.scope).edges.set(edge.id, edge);

    console.log(
      "[GraphRepository] Loaded",
      this.graph.nodes.length,
      "nodes",
      this.graph.edges.length,
      "edges",
    );
  }

  getGraph(scope: GraphScope): KnowledgeGraph {
    const state = this.scopedGraphs.get(graphScopeKey(scope));
    if (!state) return { nodes: [], edges: [] };
    return { nodes: [...state.nodes.values()], edges: [...state.edges.values()] };
  }

  addNode(node: GraphNode): GraphNode {
    const scoped = this.scoped(node.scope);
    const scopedExisting = scoped.labels.get(canonicalizeLabel(node.label));
    if (scopedExisting) return scoped.nodes.get(scopedExisting)!;
    const existingById = scoped.nodes.get(node.id);

    if (existingById) {
      return existingById;
    }

    const existingByIdentity = scoped.nodes.get(scoped.labels.get(canonicalizeLabel(node.label)) ?? "");

    if (existingByIdentity) {
      return existingByIdentity;
    }

    const canonicalLabel = canonicalizeLabel(node.label);

    const normalizedNode: GraphNode = {
      ...node,
      id: resolveGraphNodeId(node.scope, canonicalLabel),
      label: canonicalLabel,
    };

    this.graph.nodes.push(normalizedNode);
    scoped.nodes.set(normalizedNode.id, normalizedNode);
    scoped.labels.set(canonicalizeLabel(normalizedNode.label), normalizedNode.id);

    this.storage.save(this.graph);

    return normalizedNode;
  }

  addEdge(scope: GraphScope, edge: GraphEdge) {
    const state = this.scopedGraphs.get(graphScopeKey(scope));
    if (!state || graphScopeKey(edge.scope) !== graphScopeKey(scope)) throw new Error("Graph edge scope mismatch");
    if (!state.nodes.has(edge.source) || !state.nodes.has(edge.target)) throw new Error("Graph edge endpoints must belong to scope");
    const exists = state.edges.has(edge.id);

    if (!exists) {
      this.graph.edges.push(edge);
      state.edges.set(edge.id, edge);

      this.storage.save(this.graph);
    }
  }

  getNode(scope: GraphScope, id: string) {
    const state = this.scopedGraphs.get(graphScopeKey(scope));
    const node = state?.nodes.get(id);
    return node && graphScopeKey(node.scope) === graphScopeKey(scope) ? node : undefined;
  }

  getNeighbors(scope: GraphScope, id: string) {
    const state = this.scopedGraphs.get(graphScopeKey(scope));
    if (!state || !this.getNode(scope, id)) return [];
    const targets = [...state.edges.values()]
      .filter((edge) => edge.source === id)
      .map((edge) => edge.target);
    return targets
      .map((target) => state.nodes.get(target))
      .filter((node): node is GraphNode => Boolean(node) && graphScopeKey(node!.scope) === graphScopeKey(scope));
  }

  findByLabel(scope: GraphScope, label: string) {
    const state = this.scopedGraphs.get(graphScopeKey(scope));
    const node = state?.nodes.get(state.labels.get(canonicalizeLabel(label)) ?? "");
    return node && graphScopeKey(node.scope) === graphScopeKey(scope) ? node : undefined;
  }

  findAllByLabel(label: string): GraphNode[] {
    return this.graph.nodes.filter(
      (node) => node.label.toLowerCase() === label.toLowerCase(),
    );
  }

  getEdgesFrom(scope: GraphScope, nodeId: string) {
    const state = this.scopedGraphs.get(graphScopeKey(scope));
    if (!state || !this.getNode(scope, nodeId)) return [];
    return [...state.edges.values()].filter((edge) => edge.source === nodeId);
  }

  getEdgesTo(scope: GraphScope, nodeId: string) {
    const state = this.scopedGraphs.get(graphScopeKey(scope));
    if (!state || !this.getNode(scope, nodeId)) return [];
    return [...state.edges.values()].filter((edge) => edge.target === nodeId);
  }

  findEdge(
    source: string,
    relation: string,
    target: string,
  ): GraphEdge | undefined {
    return this.graph.edges.find(
      (edge) =>
        edge.source === source &&
        edge.relation === relation &&
        edge.target === target,
    );
  }

  findByIdentity(label: string): GraphNode | undefined {
    const canonicalLabel = canonicalizeLabel(label);

    return this.graph.nodes.find(
      (node) => canonicalizeLabel(node.label) === canonicalLabel,
    );
  }

  resolveNode(label: string): GraphNode | undefined {
    return this.findByIdentity(label);
  }

  updateNode(id: string, changes: Partial<GraphNode>) {
    const index = this.graph.nodes.findIndex((node) => node.id === id);

    if (index === -1) {
      return null;
    }

    const current = this.graph.nodes[index];

    const updatedNode: GraphNode = {
      ...current,

      /*
       * Identity is immutable.
       */
      id: current.id,
      label: current.label,
      createdAt: current.createdAt,

      /*
       * Mutable structural information.
       */
      type: changes.type ?? current.type,

      /*
       * Evidence is merged instead of blindly replaced.
       */
      metadata: {
        ...(current.metadata ?? {}),
        ...(changes.metadata ?? {}),
      },
    };

    this.graph.nodes[index] = updatedNode;

    this.storage.save(this.graph);

    return updatedNode;
  }

  replaceNodeId(oldId: string, newId: string) {
    const node = this.graph.nodes.find((n) => n.id === oldId);

    if (!node) {
      return;
    }

    // mover identidad del nodo
    node.id = newId;

    // actualizar relaciones
    for (const edge of this.graph.edges) {
      if (edge.source === oldId) {
        edge.source = newId;
      }

      if (edge.target === oldId) {
        edge.target = newId;
      }
    }

    this.storage.save(this.graph);
  }

  removeDuplicateLabels(keepId: string) {
    const keepNode = this.graph.nodes.find((n) => n.id === keepId);

    if (!keepNode) {
      return;
    }

    const duplicates = this.graph.nodes.filter(
      (n) =>
        n.label.toLowerCase() === keepNode.label.toLowerCase() &&
        n.id !== keepId,
    );

    for (const duplicate of duplicates) {
      console.log(`[GraphRepository] Removing duplicate ${duplicate.id}`);

      // mover edges al nodo bueno
      for (const edge of this.graph.edges) {
        if (edge.source === duplicate.id) {
          edge.source = keepId;
        }

        if (edge.target === duplicate.id) {
          edge.target = keepId;
        }
      }

      this.graph.nodes = this.graph.nodes.filter((n) => n.id !== duplicate.id);
    }

    this.storage.save(this.graph);
  }

  clear() {
    this.graph = {
      nodes: [],
      edges: [],
    };

    this.storage.save(this.graph);
  }
}

export const graphRepository = new GraphRepository();
