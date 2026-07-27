// src/memory/memory.types.ts

export enum MemoryType {

  DECISION = "decision",

  SOLUTION = "solution",

  FACT = "fact",

  PREFERENCE = "preference",

  CONVERSATION = "conversation",

  CODE = "code",

}

export interface Memory {
  knowledgeExtracted?: boolean;

  id?: string;

  text: string;

  project?: string;

  type?: MemoryType;

  importance?: number;

  confidence?: number;

  accessCount?: number;

  lastAccess?: string;

  archived?: boolean;

  createdAt?: string;

  updatedAt?: string;

  origin?: string;

  tags?: string[];

  source?: {
    file?: string;
    line?: number;
  };
}

export interface MemoryContext {
  project: string;

  currentFile?: string;

  query: string;

  memories: Memory[];
}

export interface MemoryPayload {
  projectId?: string;

  content: string;

  importance: number;

  accesses: number;

  lastAccess: string;

  archived: boolean;

  createdAt: string;

  updatedAt: string;

  [key: string]: unknown;
}

export interface RecallResult {
  id: string;

  payload: {
    archived?: boolean;

    accessCount?: number;

    importance?: number;

    [key: string]: unknown;
  };
}

export interface MemoryItem {

  id:string;

  text:string;

  importance:number;

  createdAt:string;

  knowledgeExtracted?:boolean;

}