export interface LearningRateOptions {
  /**
   * Learning rate inicial.
   * Debe ser > 0.
   */
  initial?: number;

  /**
   * Learning rate mínimo permitido.
   * Evita que llegue prácticamente a cero.
   */
  minimum?: number;
}

export class LearningRate {
  private readonly initial: number;
  private readonly minimum: number;

  constructor(options: LearningRateOptions = {}) {
    this.initial = options.initial ?? 0.01;
    this.minimum = options.minimum ?? 0.0001;

    if (this.initial <= 0) {
      throw new Error("Initial learning rate must be greater than zero.");
    }

    if (this.minimum <= 0) {
      throw new Error("Minimum learning rate must be greater than zero.");
    }

    if (this.minimum > this.initial) {
      throw new Error(
        "Minimum learning rate cannot be greater than initial learning rate.",
      );
    }
  }

  /**
   * Devuelve el learning rate para un determinado paso.
   *
   * step comienza en 1.
   */
  get(step: number): number {
    if (step <= 0) {
      return this.initial;
    }

    const lr = this.initial / Math.sqrt(step);

    return Math.max(this.minimum, lr);
  }
}
