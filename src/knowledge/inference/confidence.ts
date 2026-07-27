export function propagateConfidence(
  confidences: number[],
  ruleFactor = 0.9,
): number {
  const result =
    confidences.reduce((acc, value) => acc * value, 1) * ruleFactor;

  return Number(result.toFixed(2));
}
