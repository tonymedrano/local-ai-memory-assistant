# V1 background jobs

This document is the V1 source of truth for background execution. The runtime
does not run a global maintenance pipeline.

## Productive execution model

After bootstrap, one server-local cron runs at `04:00` and drains pending
records from the durable `TenantWorkRepository` sequentially:

```text
cron scheduler
  -> TenantWorkRepository.claimNext()
  -> persisted tenant JobScope
  -> closed dispatch by work type
```

The tenant comes only from `work.scope`, never from `work.payload`. Registry
validation rejects system work and a `payload.tenantId` that differs from the
persisted scope. A running item recovered after process restart is marked
failed; V1 does not retry it automatically. A failed item stops the current
drain and is recorded as failed.

There is no public HTTP endpoint or global cron that enqueues maintenance
work. Deployment integrations that create tenant work must persist one of the
allowed types below with an explicit tenant scope.

| Work type | Runtime behavior | V1 classification |
| --- | --- | --- |
| `knowledge-extraction` | Dispatches with the persisted tenant scope; the job filters pending memories to that tenant before processing. | `ACTIVE_TENANT_WORK` |
| `inference` | Dispatches with the persisted tenant scope and has no system fallback. | `ACTIVE_TENANT_WORK` |
| `ltr-training` | Dispatches `TrainingService.train(scope)` using the persisted tenant scope. It is not a global training cron. | `ACTIVE_TENANT_WORK` |
| `knowledge-maintenance` | The registry accepts the type, but the dispatcher rejects it before execution. | `DISABLED_FAIL_CLOSED` |

Unknown work types are rejected before completion; they never execute a job.

## V1 job matrix

| Job/function | Productive entrypoint | Scope | Current execution | Documented as V1? | Classification |
| --- | --- | --- | --- | --- | --- |
| Tenant-work scheduler | `startScheduler()` after successful bootstrap | n/a | Daily 04:00 server-local drain of pending tenant work | Yes | `ACTIVE_SCHEDULED` |
| Knowledge extraction | `knowledge-extraction` tenant work | tenant | Runs only after a durable work item is available | Yes | `ACTIVE_TENANT_WORK` |
| Inference | `inference` tenant work | tenant | Runs only after a durable work item is available | Yes | `ACTIVE_TENANT_WORK` |
| LTR training | `ltr-training` tenant work | tenant | Runs only after a durable work item is available | Yes | `ACTIVE_TENANT_WORK` |
| Knowledge maintenance | `knowledge-maintenance` tenant work | tenant | Explicit dispatcher rejection pending a tenant-safe consolidation/relearning design | No | `DISABLED_FAIL_CLOSED` |
| Lifecycle | exported `lifecycleJob` / `LifecycleScheduler` only | system | No productive scheduler invokes it | No | `DISABLED_FAIL_CLOSED` |
| Cleanup | exported `cleanupJob` only | system | No productive scheduler invokes it | No | `DISABLED_FAIL_CLOSED` |
| Context learning | exported `contextLearningJob` only | system | No productive scheduler invokes it | No | `DISABLED_FAIL_CLOSED` |
| Consolidation | exported `knowledgeConsolidationJob` only | system/global knowledge state | Not scheduled and not part of the V1 runtime contract | No | `LEGACY_NOT_V1` |
| Relearning | exported `relearningJob` only | system/global knowledge state | Not scheduled and not part of the V1 runtime contract | No | `LEGACY_NOT_V1` |

`npm run index` and `npm run cleanup` are indexer maintenance commands. They
are `MANUAL_ONLY` operational tooling and are not the memory lifecycle or
tenant-work scheduler.

## Operational boundaries

V1 has no manual HTTP trigger, automatic retry, distributed lock, or
multi-process scheduler coordination. Run one scheduler instance for a given
deployment until durable distributed coordination is introduced.
