import { ContextTopicExtractor } from "./context.topic.extractor.js";
import { ContextEntityExtractor } from "./context.entity.extractor.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

const topicExtractor = new ContextTopicExtractor();

const entityExtractor = new ContextEntityExtractor();

console.log("=== Context Topic Extractor Tests ===");

// ---------------------------------------------------------
// 1. Frontend
// ---------------------------------------------------------

const frontendQuery = "Angular TypeScript";

const frontendEntities = entityExtractor.extract(frontendQuery);

const frontendTopics = topicExtractor.extract(frontendQuery, frontendEntities);

assert(
  frontendTopics.includes("frontend"),
  "Angular TypeScript should produce frontend",
);

console.log("✓ frontend topic");

// ---------------------------------------------------------
// 2. Backend
// ---------------------------------------------------------

const backendTopics = topicExtractor.extract("Node.js API service");

assert(backendTopics.includes("backend"), "Node.js API should produce backend");

console.log("✓ backend topic");

// ---------------------------------------------------------
// 3. Retrieval
// ---------------------------------------------------------

const retrievalTopics = topicExtractor.extract("BM25 RRF LTR reranking");

assert(
  retrievalTopics.includes("retrieval"),
  "retrieval technologies should produce retrieval",
);

console.log("✓ retrieval topic");

// ---------------------------------------------------------
// 4. Knowledge
// ---------------------------------------------------------

const knowledgeTopics = topicExtractor.extract("Knowledge Graph inference");

assert(
  knowledgeTopics.includes("knowledge"),
  "Knowledge Graph should produce knowledge",
);

console.log("✓ knowledge topic");

// ---------------------------------------------------------
// 5. Infrastructure
// ---------------------------------------------------------

const infrastructureTopics = topicExtractor.extract("Docker container");

assert(
  infrastructureTopics.includes("infrastructure"),
  "Docker should produce infrastructure",
);

assert(infrastructureTopics.includes("devops"), "Docker should produce devops");

console.log("✓ infrastructure and devops topics");

// ---------------------------------------------------------
// 6. Multiple topics
// ---------------------------------------------------------

const multipleTopics = topicExtractor.extract(
  "Angular frontend calls Node.js API using Qdrant",
);

assert(multipleTopics.includes("frontend"), "frontend should be detected");

assert(multipleTopics.includes("backend"), "backend should be detected");

assert(multipleTopics.includes("database"), "database should be detected");

console.log("✓ multiple topics");

// ---------------------------------------------------------
// 7. Entity-assisted extraction
// ---------------------------------------------------------

const entityQuery = "Angular";

const entities = entityExtractor.extract(entityQuery);

const entityTopics = topicExtractor.extract("unknown query", entities);

assert(
  entityTopics.includes("frontend"),
  "entity should contribute topic signal",
);

console.log("✓ entity-assisted topic extraction");

// ---------------------------------------------------------
// 8. Empty query
// ---------------------------------------------------------

const emptyTopics = topicExtractor.extract("");

assert(emptyTopics.length === 0, "empty query should produce no topics");

console.log("✓ empty query");

// ---------------------------------------------------------
// 9. No duplicates
// ---------------------------------------------------------

const duplicatedTopics = topicExtractor.extract(
  "Angular frontend TypeScript UI components",
);

const frontendCount = duplicatedTopics.filter(
  (topic) => topic === "frontend",
).length;

assert(frontendCount === 1, "topics should not contain duplicates");

console.log("✓ duplicate topics removed");

// ---------------------------------------------------------
// 10. Unknown topic
// ---------------------------------------------------------

const unknownTopics = topicExtractor.extract("random unrelated sentence");

assert(unknownTopics.length === 0, "unknown query should not invent topics");

console.log("✓ unknown topics ignored");

// ---------------------------------------------------------
// Final
// ---------------------------------------------------------

console.log("");

console.log("=== ALL CONTEXT TOPIC EXTRACTION TESTS PASSED ===");
