# Memory Service

Memory Service is a Node.js + TypeScript service for persistent semantic
memory. V1 stores contextual memories in Qdrant, retrieves them with Ollama
embeddings, maintains local JSON state under one data directory, and runs
scheduled knowledge, lifecycle, cleanup, and LTR-maintenance jobs.

## V1 architecture

```text
HTTP (Express)
  -> controllers
  -> memory service / retrieval pipeline
  -> Ollama embeddings + Qdrant memory collection

JSON operational state
  -> DATA_DIR (atomic writes)
```

The canonical HTTP path for memory is `POST /memory` and
`POST /memory/search`. The canonical persistence path for contextual memories
is `MemoryRepository` through the Qdrant collection configured by
`MEMORY_COLLECTION`.

See [the architecture guide](docs/architecture.md) for component ownership and
[the API guide](docs/api.md) for the exposed routes.

## Requirements

- Node.js 22
- Qdrant
- Ollama with `nomic-embed-text` and `qwen2.5:14b` available

`qwen2.5:14b` is used by knowledge/consolidation workflows. `nomic-embed-text`
is used to store and search memory.

## Configure and run locally

```bash
cp .env.example .env
set -a && . ./.env && set +a
npm ci
npm run build
npm run dev
```

The service reads process environment variables; the `set -a` command above
exports the local example for the current shell. Production deployments should
provide the same variables through their platform configuration.

The service creates the two configured Qdrant collections on startup and then
loads the keyword index. It exits when that bootstrap fails.

To run the service and Qdrant with Docker:

```bash
docker compose up --build
```

On Linux, set `OLLAMA_URL` to an address reachable from the container. The
compose default (`host.docker.internal`) is appropriate for Docker Desktop.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `QDRANT_URL` | `http://localhost:6333` | Qdrant endpoint |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama endpoint |
| `COLLECTION` | `global_memory` | Indexer collection |
| `MEMORY_COLLECTION` | `contextual_memory` | Contextual-memory collection used at runtime |
| `DATA_DIR` | `data` | Canonical directory for service JSON/JSONL state |
| `EMBED_MODEL` | `nomic-embed-text` | Ollama embedding model |
| `CONTEXT_AWARE_RETRIEVAL` | `true` | Enables context-aware retrieval adjustments; set to `false` for rollback |

All global JSON and JSONL state is written under `DATA_DIR` with atomic file
replacement. The indexer's `.indexer-registry.json` is intentionally local to
each indexed project, rather than service-global state.

## Operations

- `GET /health` is a liveness endpoint. It only confirms that the HTTP process
  is running.
- `GET /ready` is a readiness endpoint. It returns `200` only after bootstrap
  completes and while Qdrant collections plus Ollama's configured models are
  available. Otherwise it returns `503` with per-check diagnostics.
- The production compose healthcheck targets `/ready`, so an alive but unusable
  instance is not treated as healthy.

Jobs are scheduled once startup succeeds. Their order and retention policy are
documented in [docs/jobs.md](docs/jobs.md).

## Testing and quality

```bash
npm test
npm run test:quality
npm run test:integration
npm run test:ci
```

Unit tests do not need external services. Integration tests use
`QDRANT_TEST_URL` and skip when it is absent. Details and rules for new tests
are in [docs/testing.md](docs/testing.md).

## V1 scope boundaries

V1 does not provide multi-process file-write coordination, distributed job
locking, persistence migration tooling, or a public endpoint for manually
triggering maintenance jobs. JSON persistence is safe against partial writes
within the single-process runtime.
