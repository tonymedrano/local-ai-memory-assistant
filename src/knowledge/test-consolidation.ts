import { KnowledgeRepository } from "./knowledge.repository.js";
import { KnowledgeConsolidator } from "./knowledge.consolidator.js";


const repository =
  new KnowledgeRepository();


const consolidator =
  new KnowledgeConsolidator();


await repository.save({
  type:"technology",
  subject:"Angular",
  content:"Frontend framework",
  relations:[],
  confidence:0.8,
  createdAt:new Date(),
});


await repository.save({
  type:"technology",
  subject:"Angular",
  content:"Uses Angular Material",
  relations:[
    {
      source:"Angular",
      relation:"uses",
      target:"Angular Material",
    }
  ],
  confidence:0.9,
  createdAt:new Date(),
});


const knowledge =
  await repository.findAll();


console.log("Before:");
console.log(
  JSON.stringify(knowledge,null,2)
);


const result =
  consolidator.consolidate(knowledge);


console.log("After:");
console.log(
  JSON.stringify(result,null,2)
);