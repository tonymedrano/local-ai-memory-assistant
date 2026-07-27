import {
  knowledgeExtractionJob
} from "./knowledge-extraction.job.js";


console.log(
  "[Test] Starting knowledge extraction job"
);


try {

  await knowledgeExtractionJob();


  console.log(
    "[Test] Knowledge extraction completed"
  );


} catch (error) {

  console.error(
    "[Test] Knowledge extraction failed",
    error
  );

}