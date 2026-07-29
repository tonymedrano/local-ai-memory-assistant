# REST API

## Memory

### Create Memory

```http
POST /memory
```

### Search Memory

```http
POST /memory/search
```

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
