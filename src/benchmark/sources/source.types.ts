export type BenchmarkSource =
  | "memory"
  | "knowledge"
  | "inference"
  | "explanation";

export interface ExtractedResult {
  text: string;
  source: BenchmarkSource;
}