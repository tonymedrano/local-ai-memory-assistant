import { findTwoHopPaths } from "./path-finder.js";

import type { DerivedKnowledge } from "./inference.types.js";

export function inferTwoHopRequires(): DerivedKnowledge[] {
  const paths = findTwoHopPaths();

  return paths.map((path) => {
    return {
      subject: path.nodes[0],

      relation: "requires",

      object: path.nodes[2],

      confidence: 0.6,

      source: path.edges,

      createdAt: new Date().toISOString(),
    };
  });
}
