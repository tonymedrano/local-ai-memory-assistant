const BASE_URL = "http://localhost:3000";

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const text = await response.text();

  let body: unknown;

  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${path} -> ${response.status}: ${text}`,
    );
  }

  return body;
}

async function main() {
  console.log("==============================");
  console.log(" Memory Service E2E Smoke Test");
  console.log("==============================");

  console.log("\n1. Health...");

  const health = await request("/health");

  if (health.status !== "ok") {
    throw new Error("Health check failed");
  }

  console.log("✓ Health OK");

  console.log("\n2. Readiness...");

  const ready = await request("/ready");

  if (ready.ready !== true) {
    throw new Error("Readiness check failed");
  }

  console.log("✓ Readiness OK");

  console.log("\n3. Memory search...");

  const search = await request("/memory/search", {
    method: "POST",
    body: JSON.stringify({
      query: "¿Qué base vectorial usamos?",
    }),
  });

  if (!Array.isArray(search)) {
    throw new Error("Search response is not an array");
  }

  if (search.length === 0) {
    throw new Error("Search returned no memories");
  }

  const first = search[0];

  if (!first.payload?.text) {
    throw new Error("Search result has no payload.text");
  }

  console.log("✓ Search returned results");
  console.log(`✓ Top result: ${first.payload.text}`);

  console.log("\n4. Memory store...");

  console.log("\n4. Memory store...");

  const marker = `V1 E2E smoke ${Date.now()}`;
  const testProject = `v1-e2e-${Date.now()}`;

  const stored = await request("/memory", {
    method: "POST",
    body: JSON.stringify({
      text: marker,
      type: "fact",
      project: testProject,
      confidence: 0.9,
      importance: 0.5,
      origin: "system",
    }),
  });

  if (!stored) {
    throw new Error("Memory store returned empty response");
  }

  console.log("✓ Memory stored");

  console.log("\n5. Memory retrieval...");

  const retrieved = await request("/memory/search", {
    method: "POST",
    body: JSON.stringify({
      query: marker,
      options: {
        project: testProject,
      },
    }),
  });

  console.log("\nRetrieved results:");
  console.dir(retrieved, { depth: null });

  console.log("\nExpected marker:");
  console.log(marker);

  if (!Array.isArray(retrieved) || retrieved.length === 0) {
    throw new Error("Stored memory could not be retrieved");
  }

  const found = retrieved.some((item) => item.payload?.text === marker);

  if (!found) {
    throw new Error("Stored memory not found in retrieval results");
  }

  console.log("✓ Stored memory retrieved");
  console.log("\n==============================");
  console.log(" V1 E2E: PASS");
  console.log("==============================");
}

main().catch((error) => {
  console.error("\n==============================");
  console.error(" V1 E2E: FAIL");
  console.error("==============================");
  console.error(error);
  process.exit(1);
});
