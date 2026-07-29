import { ContextBuilder } from "./context.builder.js";

const builder = new ContextBuilder();

export async function buildContext(query: string) {
  return builder.build(query);
}
