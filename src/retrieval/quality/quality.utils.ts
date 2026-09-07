export function clamp(value: number, min: number = 0, max: number = 1) {
  return Math.min(Math.max(value, min), max);
}

export function normalize(value: number, max: number) {
  if (max === 0) return 0;

  return clamp(value / max);
}
