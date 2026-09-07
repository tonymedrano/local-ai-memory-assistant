function dcg(scores: number[]): number {
  return scores.reduce(
    (sum, score, index) => sum + score / Math.log2(index + 2),
    0,
  );
}

export function ndcgAtK(retrieved: string[], expected: string[]): number {
  if (expected.length === 0 || retrieved.length === 0) {
    return 0;
  }

  const relevance = retrieved.map((item) =>
    expected.some((expectedItem) => item.includes(expectedItem)) ? 1 : 0,
  );

  const idealRelevantCount = Math.min(expected.length, retrieved.length);

  const ideal = Array.from({ length: retrieved.length }, (_, index) =>
    index < idealRelevantCount ? 1 : 0,
  );

  const idealScore = dcg(ideal);

  if (idealScore === 0) {
    return 0;
  }

  return dcg(relevance) / idealScore;
}
