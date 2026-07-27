import { KnowledgeSyncService } from "./knowledge-sync.service.js";

const sync = new KnowledgeSyncService();

await sync.sync();