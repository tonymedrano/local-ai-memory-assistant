# Background Jobs

## Overview

The Background Jobs layer provides automatic execution and monitoring of maintenance tasks inside the Memory Intelligence Layer.

Its main purpose is to execute periodic processes without user interaction, keeping the memory system healthy and continuously improving.

Current responsibilities:

- Execute memory lifecycle processes.
- Track job executions.
- Monitor execution status.
- Prepare the foundation for future maintenance tasks.

---

# Architecture

             Memory Service
                   |
                   |
            Background Jobs
                   |
    +--------------+--------------+
    |                             |

Lifecycle Job Cleanup Job
| |
↓ ↓
Lifecycle Service Future Maintenance
|
↓
Memory Repository
|
↓
Qdrant Vector Database


---

# Components

## Scheduler

Location:


src/jobs/scheduler.ts


Responsible for registering and executing scheduled tasks.

Current schedule:

| Job | Frequency |
|---|---|
| Lifecycle | Daily at 03:00 |
| Cleanup | Sunday at 04:00 |

Example:

```ts
cron.schedule(
  "0 3 * * *",
  async () => {
    await lifecycleJob();
  }
);
Lifecycle Job

Location:

src/jobs/lifecycle.job.ts

Connects the scheduler with the memory lifecycle system.

Responsibilities:

Start lifecycle execution.
Handle execution errors.
Register job history.

Flow:

Scheduler
    |
    ↓
Lifecycle Job
    |
    ↓
Lifecycle Service
    |
    ↓
Memory Updates
Cleanup Job

Location:

src/jobs/cleanup.job.ts

Reserved for future maintenance operations.

Planned responsibilities:

Remove orphan vectors.
Detect duplicated memories.
Validate embeddings.
Clean invalid metadata.
Job Runner

Location:

src/jobs/job.runner.ts

Provides a common execution wrapper for all jobs.

Responsibilities:

Create execution record.
Execute task.
Store completion status.
Store errors.

Flow:

runJob()

    |
    +--> start execution

    |
    +--> execute task

    |
    +--> complete / fail
Job History

Location:

src/jobs-history

Stores execution information.

Example:

{
  "id": "6e7e5b1a-0f61-4065-8dc3-f8774f646910",
  "name": "lifecycle",
  "status": "completed",
  "startedAt": "2026-07-27T09:56:01.647Z",
  "finishedAt": "2026-07-27T09:56:01.676Z",
  "duration": 29
}

Tracked information:

Job name.
Execution status.
Start time.
Finish time.
Duration.
Error information.
Monitoring API
Get job history

Endpoint:

GET /jobs/history

Example:

curl http://localhost:3000/jobs/history

Response:

[
  {
    "name": "lifecycle",
    "status": "completed",
    "duration": 29
  }
]
Docker Support

The service runs together with Qdrant using Docker Compose.

Architecture:

Docker Compose

 +----------------+
 | memory-service |
 |                |
 | Background     |
 | Jobs           |
 +-------+--------+
         |
         |
         ↓
 +----------------+
 |    Qdrant      |
 +----------------+

The service communicates with Qdrant using:

QDRANT_URL=http://qdrant:6333
Current State

Implemented:

 Scheduler system.
 Lifecycle background execution.
 Job execution wrapper.
 Execution tracking.
 Job history API.
 Docker integration.
Future Improvements
Persistent Job Storage

Current implementation stores history in memory.

Future:

Job History
      |
      ↓
 MongoDB

Benefits:

Historical analytics.
Dashboard metrics.
Failure tracking.
Retry System

Future jobs should support:

Automatic retries.
Backoff strategy.
Failure recovery.

Example:

Job failed

    ↓

Retry 1

    ↓

Retry 2

    ↓

Mark failed
Metrics

Future metrics:

Execution frequency.
Average duration.
Failure rate.
Memory processing volume.

These metrics will feed the Memory Dashboard.

Integration with Memory Intelligence Layer

Background Jobs are the execution engine of the Memory Intelligence Layer.

Current pipeline:

Memories
   |
   ↓
Lifecycle Manager
   |
   ↓
Background Jobs
   |
   ↓
Knowledge Extraction
   |
   ↓
Project Knowledge Graph
   |
   ↓
Memory Dashboard

The Background Jobs layer provides the automation required for a continuously evolving memory system.


Después haría:

```bash
mkdir -p docs
nano docs/background-jobs.md

git add docs/background-jobs.md
git commit -m "docs: add background jobs documentation"