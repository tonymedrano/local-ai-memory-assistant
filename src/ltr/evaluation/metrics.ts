export interface EvaluationSample {
  query: string;

  results: {
    id: string;
    score: number;
  }[];
  relevance: Record<string, number>;
}

export interface EvaluationResult {
  precisionAtK: number;
  recallAtK: number;
  mrr: number;
  ndcgAtK: number;
}

export function precisionAtK(
  results:string[],
  relevant:Set<string>,
  k:number
){

  const top = results.slice(0,k);

  const hits =
    top.filter(id=>relevant.has(id)).length;


  return hits / k;
}



export function recallAtK(
  results:string[],
  relevant:Set<string>,
  k:number
){

  const top = results.slice(0,k);

  const hits =
    top.filter(id=>relevant.has(id)).length;


  return hits / relevant.size;
}



export function reciprocalRank(
  results:string[],
  relevant:Set<string>
){

  for(let i=0;i<results.length;i++){

    if(relevant.has(results[i])){
      return 1/(i+1);
    }

  }

  return 0;
}



export function ndcgAtK(
 results:string[],
 relevance:Record<string,number>,
 k:number
){

 const top =
   results.slice(0,k);


 const dcg =
   top.reduce(
    (sum,id,index)=>{

      const rel =
        relevance[id] ?? 0;


      return sum +
        rel /
        Math.log2(index+2);

    },0);



 const ideal =
   Object.values(relevance)
   .sort((a,b)=>b-a)
   .slice(0,k);



 const idcg =
   ideal.reduce(
    (sum,rel,index)=>
      sum+
      rel/
      Math.log2(index+2)
   ,0);


 return idcg===0
 ?0
 :dcg/idcg;

}
