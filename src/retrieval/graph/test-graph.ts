import { GraphRetriever } from "./graph.retriever.js";

async function main() {
  const retriever = new GraphRetriever();

  const queries = [
    "Angular TypeScript",
    "Node.js",
    "Qdrant",
    "Native Federation",
  ];

  for (const query of queries) {
    console.log("\n==================================");
    console.log("QUERY:", query);
    console.log("==================================");

    const results = await retriever.search(query);

    console.table(
      results.map((r) => ({
        source: r.source,
        score: r.score.toFixed(2),
        text: r.memory.text,
      })),
    );
  }
}

main().catch(console.error);