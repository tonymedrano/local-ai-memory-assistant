import { EntityExtractor } from "./entity.extractor.js";

const extractor = new EntityExtractor();

console.log(extractor.extract("Angular Native Federation"));

console.log(extractor.extract("Node.js uses TypeScript"));