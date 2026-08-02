export interface SimilarityProvider {

  similarity(
    a: string,
    b: string
  ): Promise<number>;

}