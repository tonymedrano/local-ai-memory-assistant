# REST API

All payloads are JSON. Invalid payloads return `400` with
`code: "VALIDATION_ERROR"`; malformed JSON and bodies over 1 MB use the same
contract (`413` for the size limit). Unknown routes return `404` with
`code: "NOT_FOUND"`.

Memory and context routes require authenticated tenant identity. In JWT mode
(required for production and the local Continue MCP integration), clients send
an `Authorization: Bearer <JWT>` header and the service derives the tenant from
the configured JWT claim. Continue's MCP launcher supplies this JWT
automatically; it does not send a tenant header or tool argument.

## Operations

```http
GET /health
GET /ready
```

`/health` reports process liveness. `/ready` reports operational readiness:
bootstrap completion, Qdrant collection availability, and Ollama model
availability. It returns `200` when ready and `503` otherwise.

## Memory

### Create Memory

```http
POST /memory
```

Required body field: `text`. Optional fields are `project`, `type`,
`importance` (0–10), `confidence` (0–1), `origin`, `tags`, `metadata`, and
`source`. `type` is one of `decision`, `solution`, `fact`, `preference`,
`conversation`, or `code`.

### Search Memory

```http
POST /memory/search
```

Required body field: `query`. Optional `options` filters by `project` and
`type`.

## Context

### Build Context

```http
POST /context
```

### Feedback

```http
POST /context/feedback
```

### Memory Feedback

```http
GET /context/feedback/:memoryId
```

## Intelligence

```http
GET /memory/:id/intelligence
```

Returns:

* importance
* confidence
* archived
* learning score
* learning events

## Knowledge

```http
GET /knowledge/graph
GET /knowledge/inference
GET /knowledge/resolution
GET /knowledge/feedback
```

## Jobs

```http
GET /jobs/history
```

This route exposes execution history. V1 does not expose HTTP endpoints to
trigger maintenance jobs manually.
