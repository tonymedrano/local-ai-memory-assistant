export class Stopwatch {
  private readonly startTime = performance.now();

  elapsed(): number {
    return performance.now() - this.startTime;
  }
}
