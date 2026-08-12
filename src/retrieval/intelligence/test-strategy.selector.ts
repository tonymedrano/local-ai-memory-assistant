import { StrategySelector } from "./strategy.selector.js";

const selector = new StrategySelector();

const cases = [
  {
    name: "broad query",
    input: {
      specificity: 0.2,
      complexity: 0.1,
      semanticIntent: 0.4,
      tokenCount: 1,
    },
  },
  {
    name: "semantic query",
    input: {
      specificity: 0.8,
      complexity: 0.3,
      semanticIntent: 0.9,
      tokenCount: 3,
    },
  },
  {
    name: "complex keyword query",
    input: {
      specificity: 0.8,
      complexity: 0.8,
      semanticIntent: 0.4,
      tokenCount: 5,
    },
  },
  {
    name: "focused query",
    input: {
      specificity: 0.9,
      complexity: 0.3,
      semanticIntent: 0.5,
      tokenCount: 4,
    },
  },
];

for (const testCase of cases) {
  const result = selector.select(testCase.input);

  console.log(`\n=== ${testCase.name} ===`);
  console.log(result);
}
