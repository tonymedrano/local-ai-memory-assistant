import { randomUUID } from "crypto";
import type { StoredFeatureVector } from "./feature.schema.js";

export class FeatureStorage {
  private storage: StoredFeatureVector[] = [];

  save(data: Omit<StoredFeatureVector, "id" | "createdAt">) {
    const item: StoredFeatureVector = {
      id: randomUUID(),
      createdAt: new Date(),
      ...data,
    };

    this.storage.push(item);

    return item;
  }

  findByQuery(query: string) {
    return this.storage.filter((x) => x.query === query);
  }

  getAll() {
    return this.storage;
  }
}
