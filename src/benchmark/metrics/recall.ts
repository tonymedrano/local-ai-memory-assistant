function isRelevant(retrieved: string, expected: string[]): boolean {
  return expected.some((expectedItem) => retrieved.includes(expectedItem));
}

export function recallAtK(
  retrieved: string[],
  expected: string[],
  k: number = retrieved.length,
): number {
  if (expected.length === 0 || k <= 0) {
    return 0;
  }

  const topK = retrieved.slice(0, k);

  const hits = expected.filter((expectedItem) =>
    topK.some((result) => result.includes(expectedItem)),
  );

  return hits.length / expected.length;
}
