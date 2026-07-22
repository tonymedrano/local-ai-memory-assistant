export enum MemoryType {
  FACT = "fact",

  DECISION = "decision",

  CODE = "code",

  DOCUMENTATION = "documentation",

  PROJECT = "project",
}

export interface Memory {
  id?: string;

  text: string;

  type: MemoryType;

  project?: string;

  tags?: string[];

  createdAt?: string;
}
