const BASE_URL = "http://localhost:3000";

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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
  console.log(" Restart Persistence Test");
  console.log("==============================");

  const marker = `V1 persistence ${Date.now()}`;

  console.log("\n1. Storing test memory...");

  const stored = await request("/memory", {
    method: "POST",
    body: JSON.stringify({
      text: marker,
      type: "fact",
      project: "memory-service",
      confidence: 0.95,
      importance: 0.7,
      origin: "system",
    }),
  });

  console.log("✓ Memory stored");

  const storedId = stored?.id ?? stored?.memory?.id ?? stored?.payload?.id;

  if (!storedId) {
    throw new Error("Store response did not contain a memory ID");
  }

  console.log(`Memory ID: ${storedId}`);

  console.log("\n2. Verifying immediate retrieval...");

  const beforeRestart = await request("/memory/search", {
    method: "POST",
    body: JSON.stringify({
      query: "V1 persistence",
    }),
  });

  const foundBefore = beforeRestart.some(
    (item: any) =>
      item.payload?.id === storedId || item.payload?.text === marker,
  );

  if (!foundBefore) {
    throw new Error(`Memory not found before restart: ${storedId}`);
  }

  console.log("✓ Memory retrieved before restart");

  console.log("\n3. Restart the memory-service container now.");
  console.log("");
  console.log("Run:");
  console.log("");
  console.log("  docker compose restart memory-service");
  console.log("");
  console.log("Then press ENTER here.");

  process.stdin.resume();

  await new Promise<void>((resolve) => {
    process.stdin.once("data", () => resolve());
  });

  console.log("\n4. Checking service after restart...");

  const health = await request("/health");

  if (health.status !== "ok") {
    throw new Error("Memory service is not healthy after restart");
  }

  console.log("✓ Service healthy");

  console.log("\n5. Retrieving persisted memory...");

  const afterRestart = await request("/memory/search", {
    method: "POST",
    body: JSON.stringify({
      query: "V1 persistence",
    }),
  });

  const foundAfter = afterRestart.some(
    (item: any) =>
      item.payload?.id === storedId || item.payload?.text === marker,
  );

  if (!foundAfter) {
    throw new Error(`Memory was lost after restart: ${storedId}`);
  }

  console.log("✓ Memory survived restart");

  console.log("\n==============================");
  console.log(" Restart Persistence: PASS");
  console.log("==============================");
}

main().catch((error) => {
  console.error("\nRestart persistence test failed:");
  console.error(error);
  process.exit(1);
});
