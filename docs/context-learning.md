# Context Learning

## Goal

Improve future retrieval using previous interactions.

## Learning Events

Supported events:

* context_used
* context_ignored
* answer_accepted
* answer_rejected
* user_correction

## Adaptive Loop

```text
Query
   │
   ▼
Context Builder
   │
   ▼
LLM
   │
   ▼
Feedback
   │
   ▼
Learning Repository
   │
   ▼
Ranking
```

## Learning Score

Each memory accumulates a learning score.

Positive events increase the score.

Negative events decrease the score.

The ranking engine uses this score during retrieval.

## Intelligence Endpoint

```text
GET /memory/:id/intelligence
```

Returns:

* learning score
* number of events
* positive signals
* negative signals
* importance
* confidence
