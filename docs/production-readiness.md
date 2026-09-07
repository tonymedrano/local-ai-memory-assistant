# Production readiness evaluation

## Release evidence (2026-09-01)

The service is Node.js 22, TypeScript and Express. Runtime contextual memory
uses Ollama embeddings and Qdrant through `MemoryRepository`; retrieval adds
keyword, graph, LTR and quality stages. JSON/JSONL operational state is rooted
at `DATA_DIR`.

The production release build, real Qdrant integration, real Ollama E2E,
dependency release gate, and tenant-isolation security checks are release
evidence. `npm run build` remains a whole-repository typecheck that includes
legacy tests and manual scripts; it is not the release compile gate.

## Security model

Production HTTP requests use JWT tenant identity. Compose requires a non-empty
`JWT_SECRET` and starts with `AUTH_MODE=jwt`; optional issuer and audience
constraints may be configured. The tenant ID is written into Qdrant payloads
and used for vector filtering, keyword loading, graph access, and mutation
ownership checks.

Retrieved memory is explicitly framed as untrusted data and JSON-serialized in
the context prompt. Content inside it cannot assert a role, invoke tools, or
override application instructions.

## Correctness and limits

Memory writes deduplicate only inside the supplied tenant. Repository ownership
checks cover the corresponding storage operations. Lifecycle and cleanup are
intentionally not scheduled V1 behavior, so V1 makes no automatic deletion or
retention promise.

Ollama embedding/generation requests use a five-second timeout and return a
classified external-provider error. There are deliberately no automatic write
retries: callers must use idempotency-aware retry policy at the API gateway.

## Commands

```bash
npm run build:production # release compile/build gate
npm run build            # whole-repository TypeScript gate
npm run test:unit
npm run test:integration # set QDRANT_TEST_URL for execution
npm run eval
npm run benchmark         # requires ready Ollama/Qdrant
npm run production-check
```

`build:production` emits `dist/index.js` plus the Qdrant and graph ownership
migration CLIs and their transitive production dependencies. Docker uses this
gate before executing `npm start` (`node dist/index.js`).

Production Docker deployments must provide a non-empty `JWT_SECRET`; Compose
fails configuration before startup when it is absent. The container runs with
`AUTH_MODE=jwt`. Optional `JWT_ISSUER` and `JWT_AUDIENCE` constrain token
validation, and `JWT_TENANT_CLAIM` defaults to `tenantId`. Supply secrets via
the deployment environment or a secret manager, never source control.

`eval` runs deterministic security/correctness checks: tenant vector scope,
cross-tenant update/delete rejection, prompt-injection framing, and external
timeout/provider classification. Critical thresholds are strict: all such
checks must pass; cross-tenant leakage and unauthorized mutation must be zero.

The benchmark uses the existing retrieval benchmark dataset and reports recall,
MRR, NDCG and average latency. It is not part of the gate because it depends on
live providers and has no reproducible local baseline in this environment.

## Background-job contract

The V1 scheduler has exactly one productive schedule: daily at 04:00
(server-local time), it drains persisted tenant work with a closed dispatcher.
Knowledge extraction, inference, and LTR training are tenant-owned durable
work; they are not global maintenance crons. Knowledge maintenance is
registered but explicitly fails closed. Lifecycle, cleanup, and context
learning are disabled, while consolidation and relearning are legacy and not
part of the V1 runtime contract. The complete classification and operational
limits are in [jobs.md](jobs.md).

## Open risks

| Severity | Risk |
| --- | --- |
| Medium | No distributed job lock or multi-process scheduler coordination; run one scheduler instance per deployment. |
| Medium | A failed tenant-work item stops the current drain and is not retried automatically. Operational integrations must monitor and re-enqueue deliberately. |
| Low | Lifecycle, cleanup, context learning, consolidation, and relearning are deliberately outside V1 and must not be assumed by retention or maintenance operations. |

## Verdict

**READY for the documented V1 contract.** Background processing is limited to
the tenant-owned work explicitly listed in [jobs.md](jobs.md); deferred and
legacy global maintenance paths are not release functionality.
