export interface OllamaListedModel {
  name?: string;
  model?: string;
}

function canonicalModelName(name: string): string {
  const trimmed = name.trim();
  return trimmed.includes(":") ? trimmed : `${trimmed}:latest`;
}

/**
 * Ollama treats an omitted tag as `:latest`; explicit tags remain exact.
 */
export function ollamaModelMatches(configured: string, available: string): boolean {
  return canonicalModelName(configured) === canonicalModelName(available);
}

export function missingOllamaModels(
  configured: Iterable<string>,
  available: Iterable<OllamaListedModel>,
): string[] {
  const names = [...available].flatMap((model) =>
    [model.name, model.model].filter((name): name is string => Boolean(name)),
  );

  return [...new Set(configured)].filter(
    (required) => !names.some((availableName) => ollamaModelMatches(required, availableName)),
  );
}
