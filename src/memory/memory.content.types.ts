export type MemoryType =
  | "decision"
  | "solution"
  | "fact"
  | "preference"
  | "conversation";

export interface MemoryMetadata {
  project?: string;

  projectId?: string;

  type: MemoryType;

  importance: number;

  tags: string[];

  source?: {
    file?: string;
    line?: number;
  };

  createdAt: string;

  updatedAt: string;

  accesses: number;

  lastAccess: string;

  archived: boolean;
}

export interface Memory {
  id: string;

  content: string;

  metadata: MemoryMetadata;
}
