import { IntentDetector } from "./intent.detector.js";

const detector = new IntentDetector();

const tests = [
  "¿Por qué usamos Qdrant?",
  "¿Cuál es la arquitectura del memory-service?",
  "¿Cómo implementamos inference engine?",
  "Tengo un error en MCP",
  "Explícame knowledge graph",
];

for (const query of tests) {
  console.log(query, "=>", detector.detect(query));
}
