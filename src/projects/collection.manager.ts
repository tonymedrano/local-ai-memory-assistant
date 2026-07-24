import { QdrantClient } from "@qdrant/js-client-rest";

export class CollectionManager {
  constructor(private client: QdrantClient) {}

  async exists(name: string) {
    const result = await this.client.collectionExists(name);

    return result.exists;
  }

  async create(name: string) {
    const exists = await this.exists(name);

    if (exists) {
      return;
    }

    await this.client.createCollection(name, {
      vectors: {
        size: 768,
        distance: "Cosine",
      },
    });

    console.log(`Collection creada: ${name}`);
  }

  async ensure(name: string) {
    await this.create(name);
  }
}
