export class LifecycleService {
  async run(): Promise<void> {
    console.log("[Lifecycle] Starting...");

    await this.updateImportance();
    await this.decayImportance();
    await this.archiveOldMemories();

    console.log("[Lifecycle] Finished.");
  }

  private async updateImportance(): Promise<void> {
    console.log("[Lifecycle] updateImportance()");
  }

  private async decayImportance(): Promise<void> {
    console.log("[Lifecycle] decayImportance()");
  }

  private async archiveOldMemories(): Promise<void> {
    console.log("[Lifecycle] archiveOldMemories()");
  }
}
