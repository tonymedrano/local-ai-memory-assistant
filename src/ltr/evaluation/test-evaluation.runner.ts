import { EvaluationMetrics } 
from "./evaluation.metrics.js";

import { EvaluationRepository } 
from "./evaluation.repository.js";

import { JsonEvaluationDatasetRepository }
from "./json.evaluation.dataset.repository.js";

import { EvaluationService }
from "./evaluation.service.js";

import { MockRetrievalPipeline }
from "./mock.retrieval.pipeline.js";


async function main(){


console.log(
"=== LTR EVALUATION RUNNER ==="
);



const datasetRepository =
 new JsonEvaluationDatasetRepository();



const pipeline =
 new MockRetrievalPipeline();



const metrics =
 new EvaluationMetrics();



const repository =
 new EvaluationRepository();



const service =
 new EvaluationService(
   datasetRepository,
   pipeline,
   metrics,
   repository,
 );



const result =
 await service.evaluate(5);



console.log(
"\nRESULT"
);


console.table({

precisionAt5:
 result.precisionAtK,

recallAt5:
 result.recallAtK,

mrr:
 result.mrr,

ndcg:
 result.ndcgAtK,

});

}


main()
.catch(error=>{

console.error(error);

process.exit(1);

});