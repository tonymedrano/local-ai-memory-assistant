function dcg(scores: number[]): number {
  return scores.reduce(
    (sum, score, index) => sum + score / Math.log2(index + 2),

    0,
  );
}

export function ndcgAtK(retrieved: string[], expected: string[]): number {
  const relevance = retrieved.map((item) =>
    expected.some((expectedItem) => item.includes(expectedItem)) ? 1 : 0,
  );

  const ideal = [...relevance].sort((a, b) => b - a);

  const idealScore = dcg(ideal);

  if (idealScore === 0) {
    return 0;
  }

  return dcg(relevance) / idealScore;
}
