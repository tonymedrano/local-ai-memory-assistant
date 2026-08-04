import { inferenceRepository } from "../../knowledge/inference/inference.repository.js";
import { GraphEvidenceRetriever } from "./graph.evidence.retriever.js";


const retriever = new GraphEvidenceRetriever();

console.log(
  inferenceRepository.getAll()
);


console.log(
  await retriever.search("Node.js TypeScript")
);