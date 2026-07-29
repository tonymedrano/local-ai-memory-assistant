export interface Conflict {
  subject: string;

  object: string;

  relations: string[];

  severity: number;

  evidence: string[];

  createdAt: string;
}
