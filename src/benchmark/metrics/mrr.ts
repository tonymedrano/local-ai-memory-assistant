export function meanReciprocalRank(
  retrieved: string[],
  expected: string[],
): number {
  for (let i = 0; i < retrieved.length; i++) {
    const found = expected.some((item) => retrieved[i].includes(item));

    if (found) {
      return 1 / (i + 1);
    }
  }

  return 0;
}
