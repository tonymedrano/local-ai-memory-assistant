# Testing

## Commands

```bash
npm test
npm run test:unit
npm run test:qdrant-config
npm run test:integration
npm run test:quality
npm run test:ci
npm run test:e2e
npm run test:restart
```

`npm test` executes the isolated unit suite with Node's built-in test runner
through `tsx`. Every `*.test.ts` file directly under `src/tests/unit/` is
discovered automatically. Unit tests must not require Ollama, Qdrant, Docker,
a running HTTP service, or project data files.

`npm run test:quality` runs TypeScript compilation followed by the unit suite.
`npm run test:ci` additionally runs integration tests. It is safe without
Qdrant because those tests are explicitly reported as skipped unless their
required environment variable is set.

## Test categories

- **Unit:** files named `*.test.ts` under `src/tests/unit/`. Use fakes or
  temporary directories and include them in `npm test`.
- **Integration:** every `*.test.ts` file directly under
  `src/tests/integration/` runs with `npm run test:integration`. Qdrant tests
  use `QDRANT_TEST_URL`, create a unique collection, and delete it in `finally`.
  Without that variable, or if the provider cannot be reached, the test is
  reported as `SKIPPED_PROVIDER_UNAVAILABLE`; this is not a passing integration
  result. Existing scripts that exercise Qdrant, Ollama, or JSON persistence
  remain opt-in until each one uses this same isolation model.
- **End-to-end:** [`src/tests/test-e2e.ts`](../src/tests/test-e2e.ts), which
  targets a ready service at `http://localhost:3000`, requires Qdrant and
  Ollama, stores a uniquely named memory, and is intentionally not part of
  `npm test`.
- **Restart smoke test:** [`src/tests/test-restart-persistence.ts`](../src/tests/test-restart-persistence.ts)
  targets the same ready service, stores a memory, and waits for an operator to
  run `docker compose restart memory-service`. It verifies Qdrant-backed memory
  after the restart and is intentionally interactive.

## Rules for new tests

1. Add deterministic unit coverage to `src/tests/unit/` for logic that can be
   tested without external services.
2. Integration tests must use a dedicated test collection and clean it in a
   `finally` block.
3. File-based tests must use a temporary directory, never `data/` or
   `src/data/`.
4. Tests that need a running service must declare their prerequisites and are
   not included in the default unit command.
