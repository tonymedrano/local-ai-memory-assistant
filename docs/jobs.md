# Background jobs

Jobs start only after service bootstrap succeeds. The shared runner records job
history and prevents concurrent executions of the same named job in a process.

## Schedule (server local time)

| Time | Job | Behaviour |
| --- | --- | --- |
| Daily 03:00 | Lifecycle | Updates memory lifecycle state. |
| Daily 04:00 | Knowledge maintenance | Runs extraction → consolidation → relearning → inference sequentially. A failure stops later stages. |
| Daily 05:30 | Context learning | Processes context-learning events. |
| Daily 05:45 | LTR training | Trains only from explicit, trainable feedback; impressions are excluded. |
| Sunday 04:00 | Cleanup | Deletes archived memories whose `updatedAt` is at least 30 days old. Active, recent, or invalid-date records are kept. |

The cleanup job is intentionally idempotent. V1 has no manual HTTP trigger for
maintenance jobs and no cross-process/distributed lock; run a single scheduler
instance for a given deployment.
