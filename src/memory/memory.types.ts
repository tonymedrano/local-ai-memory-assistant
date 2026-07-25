// src/memory/memory.types.ts

export enum MemoryType {
  FACT = "fact",

  DECISION = "decision",

  CODE = "code",

  DOCUMENTATION = "documentation",

  PROJECT = "project",
}

export interface Memory {
  id?: string;

  // Contenido principal de la memoria
  text: string;

  // Categoría de memoria
  type: MemoryType;

  // Proyecto asociado
  project?: string;

  // Etiquetas para filtrado
  tags?: string[];

  // Peso de relevancia
  importance?: number;

  // Confianza del sistema
  confidence?: number;

  // Número de veces recuperada
  accessCount?: number;

  // Último acceso
  lastAccessed?: string;

  // Origen de la memoria
  origin?: "user" | "system" | "indexer";

  // Origen técnico de la información
  source?: {
    file?: string;
    line?: number;
  };

  // Fecha creación
  createdAt?: string;

  // Última actualización
  updatedAt?: string;

  // Caducidad opcional
  expiresAt?: string;
}

export interface MemoryContext {
  project: string;

  currentFile?: string;

  query: string;

  memories: Memory[];
}
