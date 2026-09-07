export class EvaluationMetrics {
  precisionAtK(
    retrieved: string[],
    relevant: Record<string, number>,
    k: number,
  ): number {
    const topK = retrieved.slice(0, k);

    const hits = topK.filter((id) => id in relevant).length;

    return hits / k;
  }

  recallAtK(
    retrieved: string[],
    relevant: Record<string, number>,
    k: number,
  ): number {
    const topK = retrieved.slice(0, k);

    const hits = topK.filter((id) => id in relevant).length;

    const total = Object.keys(relevant).length;

    if (total === 0) {
      return 0;
    }

    return hits / total;
  }

  mrr(retrieved: string[], relevant: Record<string, number>): number {
    for (let i = 0; i < retrieved.length; i++) {
      if (retrieved[i] in relevant) {
        return 1 / (i + 1);
      }
    }

    return 0;
  }

  ndcgAtK(
    retrieved: string[],
    relevant: Record<string, number>,
    k: number,
  ): number {
    const dcg = this.dcg(retrieved.slice(0, k), relevant);

    const ideal = Object.entries(relevant)
      .sort(([, a], [, b]) => b - a)
      .slice(0, k)
      .map(([id]) => id);

    const idcg = this.dcg(ideal, relevant);

    if (idcg === 0) {
      return 0;
    }

    return dcg / idcg;
  }

  private dcg(ids: string[], relevant: Record<string, number>): number {
    return ids.reduce((sum, id, index) => {
      const relevance = relevant[id] ?? 0;

      return sum + relevance / Math.log2(index + 2);
    }, 0);
  }
}
