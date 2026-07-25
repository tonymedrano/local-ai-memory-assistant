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

  // Origen de la memoria
  source?: {
    file?: string;
    line?: number;
  };

  // Fecha creación
  createdAt?: string;

  // Última actualización
  updatedAt?: string;
}

export interface MemoryContext {
  project: string;
  currentFile?: string;
  query: string;
  memories: Memory[];
}
