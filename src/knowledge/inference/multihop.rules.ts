import { findTwoHopPaths } from "./path-finder.js";

import type { DerivedKnowledge } from "./inference.types.js";

import { propagateConfidence } from "./confidence.js";

export function inferTwoHopRequires(): DerivedKnowledge[] {
  const paths = findTwoHopPaths();

  return paths.map((path) => {
    return {
      subject: path.nodes[0],

      relation: "requires",

      object: path.nodes[2],

      confidence: propagateConfidence(
        path.edges.map((edge) => edge.confidence),
      ),

      source: path.edges.map((edge) => edge.id),

      createdAt: new Date().toISOString(),
    };
  });
}
