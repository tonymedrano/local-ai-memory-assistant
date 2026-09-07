import { QueryAnalyzer } from './query.analyzer.js';

const analyzer = new QueryAnalyzer();

const queries = [
  'angular signals',
  'typescript interfaces',
  'Angular',
  'Angular computed signals lifecycle',
  '¿qué relación existe entre Angular y TypeScript?',
  '¿qué decidimos sobre LTR ayer?',
  'memory service docker',
  'cómo funciona el reranking',
  '"angular signals"',
  '¿cuál es la diferencia entre BM25 y RRF?',
  '',
];

for (const query of queries) {
  console.log('\nQUERY:', JSON.stringify(query));

  console.dir(
    analyzer.analyze(query),
    {
      depth: null,
    },
  );
}