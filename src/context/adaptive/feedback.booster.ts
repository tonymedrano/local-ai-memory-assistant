export class FeedbackBooster {
  getScore(_memoryId: string): number {
    // This global adaptive path has no tenant scope. It must not consume
    // tenant-private context feedback until its contract becomes scoped.
    return 0;
  }

  boost(baseScore: number, memoryId: string) {
    return baseScore + this.getScore(memoryId) * 0.2;
  }
}
