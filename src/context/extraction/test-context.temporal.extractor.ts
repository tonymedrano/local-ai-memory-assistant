import { ContextTemporalExtractor } from "./context.temporal.extractor.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

const extractor = new ContextTemporalExtractor();

const reference = new Date("2026-08-24T10:30:00.000Z");

console.log("=== Context Temporal Extractor Tests ===");

// 1. Yesterday

const yesterday = extractor.extract("¿Qué decidimos ayer?", reference);

assert(yesterday !== undefined, "yesterday should produce temporal context");

assert(yesterday!.isRelative === true, "yesterday should be relative");

assert(
  yesterday!.referenceTime === reference.toISOString(),
  "reference time should be preserved",
);

assert(
  new Date(yesterday!.from!).getUTCDate() === 23,
  "yesterday from should be August 23",
);

console.log("✓ yesterday");

// 2. Today

const today = extractor.extract("¿Qué hicimos hoy?", reference);

assert(today !== undefined, "today should produce temporal context");

assert(
  new Date(today!.from!).getUTCDate() === 24,
  "today from should be August 24",
);

assert(
  new Date(today!.to!).getUTCHours() === 23,
  "today to should end the day",
);

console.log("✓ today");

// 3. Tomorrow

const tomorrow = extractor.extract("¿Qué haremos mañana?", reference);

assert(tomorrow !== undefined, "tomorrow should produce temporal context");

assert(
  new Date(tomorrow!.from!).getUTCDate() === 25,
  "tomorrow should be August 25",
);

console.log("✓ tomorrow");

// 4. Last week

const lastWeek = extractor.extract(
  "¿Qué decidimos la semana pasada?",
  reference,
);

assert(lastWeek !== undefined, "last week should produce context");

assert(
  lastWeek!.from !== undefined && lastWeek!.to !== undefined,
  "last week should have range",
);

console.log("✓ last week");

// 5. Current week

const currentWeek = extractor.extract("¿Qué hicimos esta semana?", reference);

assert(currentWeek !== undefined, "current week should produce context");

console.log("✓ current week");

// 6. Last month

const lastMonth = extractor.extract("¿Qué pasó el mes pasado?", reference);

assert(lastMonth !== undefined, "last month should produce context");

assert(
  new Date(lastMonth!.from!).getUTCMonth() === 6,
  "last month should be July",
);

console.log("✓ last month");

// 7. Recent

const recent = extractor.extract("¿Qué cambios recientes hicimos?", reference);

assert(recent !== undefined, "recent should produce temporal context");

assert(recent!.isRelative === true, "recent should be relative");

assert(
  recent!.from === undefined && recent!.to === undefined,
  "recent should not invent a time range",
);

console.log("✓ recent");

// 8. English

const english = extractor.extract("What did we decide yesterday?", reference);

assert(english !== undefined, "English temporal expression should work");

console.log("✓ English temporal expression");

// 9. No temporal signal

const none = extractor.extract("Angular TypeScript", reference);

assert(none === undefined, "non-temporal query should produce undefined");

console.log("✓ no temporal context");

// 10. Empty query

const empty = extractor.extract("", reference);

assert(empty === undefined, "empty query should produce undefined");

console.log("✓ empty query");

// 11. Invalid reference

let invalidRejected = false;

try {
  extractor.extract("ayer", new Date("invalid"));
} catch {
  invalidRejected = true;
}

assert(invalidRejected, "invalid reference time should be rejected");

console.log("✓ invalid reference rejected");

console.log("");

console.log("=== ALL CONTEXT TEMPORAL EXTRACTION TESTS PASSED ===");
