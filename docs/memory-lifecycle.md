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

Archived memories can eventually be removed automatically.

Lifecycle execution is handled by scheduled background jobs.
