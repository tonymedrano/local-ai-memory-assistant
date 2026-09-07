import { findTwoHopPaths } from "./path-finder.js";
import type { GraphScope } from "../graph/graph.types.js";

import type { DerivedKnowledge } from "./inference.types.js";

import { propagateConfidence } from "./confidence.js";

import { getGraph } from "../graph/graph.service.js";

export function inferTwoHopRequires(scope: GraphScope): DerivedKnowledge[] {
  const paths = findTwoHopPaths(scope);
  const validPaths = paths.filter((path) => path.nodes[0] !== path.nodes[2]);

  const graph = getGraph(scope);

  return validPaths.map((path) => {
    const subjectId = path.nodes[0];

    const objectId = path.nodes[2];

    const subjectNode = graph.nodes.find((node: any) => node.id === subjectId);

    const objectNode = graph.nodes.find((node: any) => node.id === objectId);

    return {
      subject: subjectId,

      subjectLabel: subjectNode?.label ?? subjectId,

      relation: "requires",

      object: objectId,

      objectLabel: objectNode?.label ?? objectId,

      confidence: propagateConfidence(
        path.edges.map((edge) => edge.confidence),
      ),

      source: path.edges.map((edge) => edge.id),

      createdAt: new Date().toISOString(),
    };
  });
}
