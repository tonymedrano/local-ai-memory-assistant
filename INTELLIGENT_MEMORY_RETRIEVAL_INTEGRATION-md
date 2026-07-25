## Intelligent Memory Retrieval Integration

El endpoint `/context`, utilizado por Continue para recuperar contexto antes de cada consulta al modelo, ha sido actualizado para utilizar el nuevo motor de recuperación inteligente.

### Arquitectura

```
Continue
      │
      ▼
POST /context
      │
      ▼
retrieveMemoryContext()
      │
      ├── Generación de embedding
      ├── Búsqueda semántica en Qdrant
      ├── Ranking híbrido
      ├── Actualización de estadísticas
      ├── Consolidación de memorias
      └── Selección del mejor contexto
      │
      ▼
Continue
```

## Memory Retrieval Pipeline

El proceso completo de recuperación se compone de varias etapas:

1. Generación del embedding de la consulta.
2. Búsqueda vectorial en Qdrant.
3. Ranking mediante similitud semántica y calidad de la memoria.
4. Actualización automática del ciclo de vida de la memoria.
5. Consolidación de memorias similares.
6. Construcción del contexto enviado al LLM.

## Ranking Inteligente

Las memorias ya no se ordenan únicamente por similitud del embedding.

La puntuación final combina dos métricas:

```
Final Score =
0.70 × Semantic Similarity +
0.30 × Memory Score
```

Donde el **Memory Score** tiene en cuenta:

- importancia (`importance`)
- confianza (`confidence`)
- frecuencia de uso (`accessCount`)
- antigüedad (`createdAt`)

Esto permite priorizar memorias de mayor calidad aunque tengan una similitud ligeramente inferior.

## Consolidación Automática

Cuando se detecta una memoria prácticamente idéntica, el sistema evita crear duplicados.

En su lugar:

- reutiliza el mismo identificador
- incrementa `accessCount`
- aumenta `confidence`
- actualiza `updatedAt`

Esto mantiene la base vectorial limpia y mejora progresivamente la calidad de las memorias más útiles.

## Integración con Continue

El formato del endpoint `/context` permanece completamente compatible con Continue.

No ha sido necesario modificar la configuración del cliente.

Continue sigue consumiendo:

```
POST /context
```

y recibe:

```json
[
  {
    "name": "Global Memory",
    "description": "Qdrant local memory",
    "content": "- Memoria 1\n- Memoria 2\n..."
  }
]
```

Internamente, el servicio utiliza el nuevo motor de recuperación inteligente sin modificar la API pública.

## Estado actual

Actualmente el sistema proporciona:

- ✅ Almacenamiento vectorial en Qdrant
- ✅ Embeddings locales
- ✅ Búsqueda semántica
- ✅ Recuperación contextual
- ✅ Ranking híbrido
- ✅ Deduplicación automática
- ✅ Consolidación de memorias
- ✅ Actualización de confianza
- ✅ Contador de accesos
- ✅ Integración con Continue mediante `/context`

## Próxima fase

La siguiente evolución consistirá en convertir la memoria en un sistema completamente autónomo mediante un **Memory Lifecycle Manager**, responsable de:

- degradar memorias poco utilizadas
- promocionar conocimiento relevante
- eliminar información caducada
- archivar conocimiento obsoleto
- mantener la calidad de la memoria a largo plazo