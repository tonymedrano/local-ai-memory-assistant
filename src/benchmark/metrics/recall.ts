export function recallAtK(retrieved: string[], expected: string[]): number {
  if (expected.length === 0) {
    return 0;
  }

  const hits = expected.filter((item) =>
    retrieved.some((result) => result.includes(item)),
  );

  return hits.length / expected.length;
}
