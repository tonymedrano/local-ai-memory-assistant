# Memory Lifecycle

Every memory evolves over time.

```text
Created
   │
   ▼
Important
   │
   ▼
Decay
   │
   ▼
Archived
   │
   ▼
Deleted
```

## Importance

Represents long-term value.

## Confidence

Represents trust.

## Decay

Unused memories gradually lose importance.

## Archive

Old low-value memories become archived.

## Cleanup

Archived memories can eventually be removed by a future tenant-safe lifecycle
implementation.

Lifecycle execution is not scheduled in V1. See [the V1 jobs contract](jobs.md).
