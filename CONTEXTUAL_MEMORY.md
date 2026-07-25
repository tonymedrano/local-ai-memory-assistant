# Contextual Memory System

## Implementación de memoria contextual persistente

Fecha: 25/07/2026

Se ha implementado la primera versión funcional del sistema de memoria contextual del **Local AI Memory Assistant**.

El objetivo de esta fase era crear una memoria independiente del sistema RAG documental, permitiendo al asistente almacenar decisiones, hechos y conocimiento relevante del proyecto y recuperarlos posteriormente mediante búsqueda semántica.

---

# Arquitectura de memoria

El sistema ahora separa dos conceptos diferentes:


Qdrant
│
├── project_memory_service
│ │
│ ├── Código fuente
│ ├── Documentación
│ ├── README
│ └── Archivos indexados
│
├── global_memory
│ │
│ └── Memoria global del sistema
│
└── contextual_memory
│
├── Decisiones técnicas
├── Hechos importantes
├── Soluciones
└── Conocimiento persistente


La colección `project_memory_service` sigue siendo utilizada para RAG sobre el proyecto.

La nueva colección `contextual_memory` está destinada exclusivamente a memoria persistente.

---

# Modelo de memoria

Se ha creado un modelo tipado para representar diferentes clases de memoria:

```ts
export enum MemoryType {

  FACT = "fact",

  DECISION = "decision",

  CODE = "code",

  DOCUMENTATION = "documentation",

  PROJECT = "project",

}

Cada memoria contiene:

export interface Memory {

  id?: string;

  text: string;

  type: MemoryType;

  project?: string;

  tags?: string[];

  createdAt?: string;

}

Ejemplo:

{
  "text": "El proyecto memory-service utiliza Qdrant como base vectorial local",
  "type": "decision",
  "project": "memory-service",
  "tags": [
    "qdrant"
  ]
}
Flujo de almacenamiento

Cuando se crea una nueva memoria:

POST /memory

      |
      v

memory.controller.ts

      |
      v

memory.service.ts

      |
      +----------------+
      |                |
      v                v

Ollama             Metadata
Embedding

      |
      v

Vector 768 dimensiones

      |
      v

Qdrant contextual_memory

El sistema:

Recibe la memoria.
Genera un embedding mediante Ollama.
Guarda el vector en Qdrant.
Persiste la información adicional como payload.
Añade fecha de creación.
Servicio de memoria

Se ha implementado memory.service.ts con dos operaciones principales:

Store

Responsable de almacenar nuevas memorias.

Proceso:

Memory
  |
  v
createEmbedding()
  |
  v
Vector
  |
  v
saveMemory()
  |
  v
Qdrant
Recall

Permite recuperar conocimiento mediante similitud semántica.

Proceso:

Pregunta del usuario

        |
        v

Embedding de consulta

        |
        v

Búsqueda vectorial

        |
        v

Memorias relacionadas

Ejemplo:

Pregunta:

¿Qué tecnología usamos para almacenar vectores?

Memoria almacenada:

El proyecto memory-service utiliza Qdrant como base vectorial local

Resultado:

{
  "score": 0.6129678,
  "payload": {
    "text": "El proyecto memory-service utiliza Qdrant como base vectorial local",
    "type": "decision",
    "project": "memory-service"
  }
}

La recuperación funciona por significado, no por coincidencia exacta de texto.

API implementada
Crear memoria

Endpoint:

POST /memory

Ejemplo:

curl -X POST http://localhost:3000/memory \
-H "Content-Type: application/json" \
-d '
{
  "text":"El proyecto memory-service utiliza Qdrant como base vectorial local",
  "type":"decision",
  "project":"memory-service",
  "tags":["qdrant"],
  "importance":0.9
}
'

Respuesta:

{
  "text":"El proyecto memory-service utiliza Qdrant como base vectorial local",
  "type":"decision",
  "project":"memory-service",
  "tags":["qdrant"],
  "importance":0.9,
  "id":"b821a55b-c6bb-43bd-8815-f8eda3b928b9",
  "createdAt":"2026-07-25T16:43:01.663Z"
}
Buscar memoria

Endpoint:

POST /memory/search

Ejemplo:

curl -X POST http://localhost:3000/memory/search \
-H "Content-Type: application/json" \
-d '
{
  "query":"¿Qué tecnología usamos para almacenar vectores?"
}
'

Respuesta:

{
  "result":[
    {
      "score":0.6129678,
      "payload":{
        "text":"El proyecto memory-service utiliza Qdrant como base vectorial local"
      }
    }
  ]
}
Qdrant contextual_memory

La colección utilizada:

contextual_memory

Configuración:

{
  "vectors": {
    "size": 768,
    "distance": "Cosine"
  }
}

La distancia Cosine permite recuperar memorias relacionadas semánticamente.

Problemas resueltos durante la implementación

Durante esta fase se solucionaron varios problemas de infraestructura:

Servicio incorrecto en ejecución

El puerto 3000 estaba ocupado por un contenedor Docker antiguo:

memory-service-dev

La API que se estaba probando no correspondía al código actualizado.

Se reconstruyó la imagen Docker para utilizar la versión actual.

Compatibilidad TypeScript / Node

Se detectó incompatibilidad entre:

Node 22
@types/node 26
thread-stream

El error:

Namespace "worker_threads" has no exported member "TransferListItem"

se solucionó alineando las versiones:

Node.js       22.23.1
@types/node  22.20.1
TypeScript    5.9
Estado actual

La primera versión de memoria contextual está completada:

Funcionalidad	              Estado

Modelo Memory	              ✅
Tipos de memoria	          ✅
Colección contextual_memory	  ✅
Generación de embeddings	  ✅
Persistencia en Qdrant	      ✅
Metadata asociada	          ✅
API de escritura	          ✅
API de búsqueda	              ✅
Recuperación semántica	      ✅