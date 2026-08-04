import type { InteractionEvent } from "./interaction.types.js";

export class InteractionRepository {
  private readonly events: InteractionEvent[] = [];

  add(event: InteractionEvent): void {
    this.events.push(event);
  }

  getAll(): InteractionEvent[] {
    return [...this.events];
  }

  count(): number {
    return this.events.length;
  }

  clear(): void {
    this.events.length = 0;
  }
}