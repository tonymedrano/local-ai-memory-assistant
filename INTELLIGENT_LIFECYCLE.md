# Memoria contextual inteligente y ciclo de vida de memoria

## Introducción

En esta fase se ha evolucionado el sistema de memoria desde un almacenamiento vectorial básico hacia una **memoria contextual con ciclo de vida**, capaz de reconocer información existente, evitar duplicados y reforzar conocimiento mediante el uso continuado.

La memoria ahora no solo almacena información, sino que mantiene una identidad y una evolución temporal.

---

# Nueva arquitectura de memoria

Anteriormente el flujo era:


Usuario
|
v
Crear embedding
|
v
Guardar vector en Qdrant


Ahora el flujo es:


Nueva memoria
|
v
Crear embedding
|
v
Buscar memorias similares
|
|
+---+---+
| |
v v
Existe Nueva
| |
| |
Actualizar Crear
|
v
Incrementar relevancia


---

# Colección contextual_memory

Se ha añadido una nueva colección independiente en Qdrant:


Qdrant

├── global_memory
│ |
│ └── Código indexado del proyecto
│
├── project_memory_service
│ |
│ └── Información estructural del proyecto
│
└── contextual_memory
|
├── decisiones
├── hechos
├── soluciones
└── conocimiento adquirido


La colección `contextual_memory` está destinada a almacenar recuerdos generados durante el uso del asistente.

---

# Inicialización automática de colecciones

El servicio ahora inicializa automáticamente las colecciones necesarias al arrancar.

Anteriormente:

```ts
initCollection()

solo creaba:

global_memory

Ahora:

Promise.all([
  initCollection(),
  initMemoryCollection()
])

crea:

global_memory
contextual_memory

Esto evita errores al intentar acceder a memoria contextual antes de que exista.

Evolución del modelo Memory

La interfaz Memory ha sido ampliada para soportar ciclo de vida:

export interface Memory {

  id?: string;

  text: string;

  type: MemoryType;

  project?: string;

  tags?: string[];

  importance?: number;

  confidence?: number;

  accessCount?: number;

  origin?: string;

  createdAt?: string;

  updatedAt?: string;

}
Nuevos campos de inteligencia
importance

Representa la importancia inicial de la memoria.

Ejemplo:

{
 "importance":0.9
}

Una decisión arquitectónica importante tendrá mayor peso.

confidence

Representa la confianza del sistema en esa memoria.

Ejemplo:

{
 "confidence":0.8
}

Cada uso repetido puede aumentar la confianza.

accessCount

Número de veces que una memoria ha sido recuperada o confirmada.

Ejemplo:

{
 "accessCount":5
}

Permite conocer qué información es realmente relevante.

origin

Indica el origen de la memoria.

Ejemplo:

{
 "origin":"user"
}

Posibles futuros valores:

user
system
indexer
code
agent
Deduplicación semántica

Se ha implementado una primera capa de deduplicación basada en embeddings.

Cuando llega una nueva memoria:

"Usamos Qdrant como base vectorial local"

el sistema:

Genera el embedding.
Busca memorias similares en contextual_memory.
Calcula similitud semántica.
Decide si crear una nueva memoria o actualizar una existente.
Ejemplo

Primera inserción:

{
"text":"Usamos Qdrant como base vectorial local",
"type":"decision",
"project":"memory-service"
}

Resultado:

{
"id":"2b19c4a1...",
"accessCount":0
}

Segunda inserción del mismo conocimiento:

{
"text":"Usamos Qdrant como base vectorial local"
}

Resultado:

{
"id":"2b19c4a1...",
"accessCount":1,
"updatedAt":"..."
}

El sistema:

No crea un nuevo vector.
Conserva la identidad de la memoria.
Incrementa su frecuencia de uso.
Actualiza la fecha de modificación.
Resultado en Qdrant

Antes:

contextual_memory

├── memoria 1
├── memoria 2
├── memoria 3

Podían existir duplicados.

Ahora:

contextual_memory

└── memoria única

    text:
    "Usamos Qdrant como base vectorial local"

    confidence:
    0.8

    accessCount:
    1

    updatedAt:
    fecha última utilización
Cambios en API
Crear memoria

Endpoint:

POST /memory

Ejemplo:

curl -X POST http://localhost:3000/memory \
-H "Content-Type: application/json" \
-d '{
"text":"Usamos Qdrant como base vectorial local",
"type":"decision",
"project":"memory-service"
}'

Respuesta:

{
"text":"Usamos Qdrant como base vectorial local",
"type":"decision",
"project":"memory-service",
"id":"...",
"importance":0.5,
"confidence":0.8,
"accessCount":0,
"createdAt":"...",
"updatedAt":"...",
"origin":"user"
}
Estado actual del sistema

Actualmente el servicio dispone de:

✅ Indexación de proyectos
✅ Memoria vectorial con Qdrant
✅ Recuperación semántica
✅ Memoria contextual separada
✅ Metadata enriquecida
✅ Deduplicación semántica
✅ Actualización de memorias existentes
✅ Seguimiento de accesos
✅ Confianza e importancia inicial

Próxima fase: Memory Consolidation

La siguiente evolución será implementar un servicio específico:

memory-consolidation.service.ts

Responsabilidades:

Fusionar memorias similares.
Combinar información complementaria.
Incrementar confianza.
Mantener historial de fusiones.
Promover conocimiento frecuente.
Preparar memoria a largo plazo.

Objetivo:

Convertir una colección de vectores en una memoria persistente capaz de evolucionar con el uso.