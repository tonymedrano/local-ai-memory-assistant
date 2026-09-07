export function improvement(baseline: number, ltr: number) {
  if (baseline === 0) return null;

  return ((ltr - baseline) / baseline) * 100;
}
