# Architecture

## Overview

Memory Service is organized as a set of independent modules responsible for storing memories, extracting knowledge, learning from interactions and building optimized context for LLMs.

```text
                   Client
                      │
                      ▼
              Context Builder
                      │
                      ▼
               Ranking Engine
                      │
                      ▼
               Memory Service
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    Memories     Knowledge      Learning
        │             │             │
        ▼             ▼             ▼
      Qdrant    Knowledge Graph   Feedback
```

## Main Components

### Memory

Stores semantic memories in Qdrant.

Responsibilities:

* Store memories
* Semantic search
* Similarity detection
* Importance
* Confidence

### Context

Builds the prompt sent to the LLM.

Responsibilities:

* Search
* Ranking
* Filtering
* Compression
* Prompt generation

### Knowledge

Transforms memories into structured knowledge.

Responsibilities:

* Knowledge extraction
* Consolidation
* Knowledge graph
* Inference
* Explanation
* Conflict resolution

### Learning

Learns from system usage.

Responsibilities:

* Context usage
* User feedback
* Accepted answers
* Rejected answers
* Adaptive ranking

## Storage

* Qdrant → semantic memories
* JSON storage → learning, jobs and knowledge graph
