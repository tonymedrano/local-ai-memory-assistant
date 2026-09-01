export class ExternalProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly kind: "timeout" | "unavailable" | "invalid-response",
  ) {
    super(message);
    this.name = "ExternalProviderError";
  }
}

export async function fetchWithTimeout(
  provider: string,
  url: string,
  init: RequestInit,
  timeoutMs = 5_000,
  fetchImplementation: typeof fetch = fetch,
): Promise<Response> {
  try {
    const response = await fetchImplementation(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new ExternalProviderError(
        `${provider} returned status ${response.status}`,
        provider,
        "unavailable",
      );
    }

    return response;
  } catch (error) {
    if (error instanceof ExternalProviderError) throw error;

    const kind = error instanceof DOMException && error.name === "TimeoutError"
      ? "timeout"
      : "unavailable";
    const reason = error instanceof Error ? error.message : String(error);
    throw new ExternalProviderError(
      `${provider} ${kind}: ${reason}`,
      provider,
      kind,
    );
  }
}
