# Continue + global-memory MCP

## Status

**READY** for the validated read path only:

```text
Continue -> global-memory MCP -> search_memory -> automatic JWT
-> tenant-scoped POST /context -> retrieval
```

Automatic writes from Continue are not part of this MCP integration. The only
protocol-level tool currently exposed by the server is `search_memory`.
Continue may display it with a namespaced name such as
`global_memory_search_memory`; that is a client presentation detail, not the
MCP contract.

## Local setup

The local memory service and the Continue launcher share the same JWT contract.
Run the local service with `AUTH_MODE=jwt`; `docker-compose.dev.yml` reads the
JWT settings from the ignored local `.env` instead of forcing development
authentication.

Create `.env` from `.env.example` and provide safe local values:

```env
AUTH_MODE=jwt
JWT_SECRET=<local-secret>
JWT_TENANT_CLAIM=tenantId
CONTINUE_MEMORY_TENANT_ID=continue-local
MEMORY_SERVICE_URL=http://localhost:3000

# Optional JWT constraints and launcher settings
JWT_ISSUER=
JWT_AUDIENCE=
CONTINUE_MEMORY_SUBJECT=
CONTINUE_MEMORY_JWT_TTL_SECONDS=
```

Do not put a JWT or any other secret in Continue configuration. The launcher
loads the ignored `.env` and creates the short-lived, tenant-scoped JWT itself.
The authenticated tenant comes exclusively from the configured JWT claim;
Continue does not pass it as a tool argument and does not select a fallback
tenant.

Configure Continue with this single canonical MCP server entry:

```yaml
mcpServers:
  - name: global-memory
    command: node
    args:
      - scripts/continue-mcp.mjs
    cwd: /Users/tonymedrano/Public/memory-service
```

The direct `npx --yes tsx .../src/mcp/server.ts` invocation is not the
recommended Continue configuration: it bypasses the local JWT launcher.

## Validated end-to-end check

The real integration was validated through Continue Agent, `global-memory`,
`search_memory`, automatic JWT authentication, tenant `continue-local`, and
`POST /context`, producing non-empty context. The memory used for that check
was created through the regular `POST /memory` product API, not by the MCP
server.

Use this prompt in Continue as a smoke test:

```text
Usa la memoria global para buscar:
GRAPH-TENANT-ISOLATION-CONTINUE-2026

Dime qué recuperaste.
No uses búsqueda web.
```

The marker identifies a memory stating that graph memory is isolated by the
authenticated tenant scope.

Tenant-isolation evidence for this check:

| Observation | Validated value |
| --- | --- |
| `continue-local` memories before the test | 0 |
| `continue-local` memories after the test | 1 |
| Legacy memories without `tenantId` | 10 |
| Legacy memories modified | 0 |
| Cross-tenant leakage observed | 0 |

The ten legacy memories remain invisible to `continue-local`. There is no
automatic ownership migration and no fallback from an authenticated tenant to
legacy memory.

## Troubleshooting an empty result

An empty MCP result does not by itself mean that MCP transport or JWT
authentication failed. `/context` can return its safe prompt scaffold when no
tenant-visible memory is retrieved. In the initial validated case,
`continue-local` had zero memories and the ten legacy memories without a
tenant were correctly excluded. Check the authenticated tenant's data and the
query before changing authentication or tenant filtering.
