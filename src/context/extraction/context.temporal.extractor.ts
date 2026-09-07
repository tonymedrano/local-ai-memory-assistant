import type { TemporalContext } from "../model/context.types.js";

export class ContextTemporalExtractor {
  extract(
    query: string,
    referenceTime: Date = new Date(),
  ): TemporalContext | undefined {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return undefined;
    }

    const reference = new Date(referenceTime);

    if (Number.isNaN(reference.getTime())) {
      throw new Error("Invalid reference time");
    }

    if (normalized.includes("ayer") || normalized.includes("yesterday")) {
      return this.dayOffset(reference, -1);
    }

    if (normalized.includes("hoy") || normalized.includes("today")) {
      return this.dayOffset(reference, 0);
    }

    if (normalized.includes("mañana") || normalized.includes("tomorrow")) {
      return this.dayOffset(reference, 1);
    }

    if (
      normalized.includes("semana pasada") ||
      normalized.includes("last week")
    ) {
      return this.weekOffset(reference, -1);
    }

    if (
      normalized.includes("esta semana") ||
      normalized.includes("this week")
    ) {
      return this.currentWeek(reference);
    }

    if (
      normalized.includes("mes pasado") ||
      normalized.includes("last month")
    ) {
      return this.monthOffset(reference, -1);
    }

    if (normalized.includes("este mes") || normalized.includes("this month")) {
      return this.currentMonth(reference);
    }

    if (
      normalized.includes("reciente") ||
      normalized.includes("recientes") ||
      normalized.includes("recent") ||
      normalized.includes("recently") ||
      normalized.includes("latest") ||
      normalized.includes("último") ||
      normalized.includes("última") ||
      normalized.includes("últimos") ||
      normalized.includes("últimas") ||
      normalized.includes("previous") ||
      normalized.includes("anterior")
    ) {
      return {
        referenceTime: reference.toISOString(),
        isRelative: true,
      };
    }

    return undefined;
  }

  private dayOffset(reference: Date, offset: number): TemporalContext {
    const from = new Date(reference);

    from.setUTCDate(from.getUTCDate() + offset);
    from.setUTCHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setUTCHours(23, 59, 59, 999);

    return {
      referenceTime: reference.toISOString(),
      from: from.toISOString(),
      to: to.toISOString(),
      isRelative: true,
    };
  }

  private currentWeek(reference: Date): TemporalContext {
    const from = new Date(reference);

    const day = from.getUTCDay();

    const mondayOffset = day === 0 ? -6 : 1 - day;

    from.setUTCDate(from.getUTCDate() + mondayOffset);

    from.setUTCHours(0, 0, 0, 0);

    const to = new Date(from);

    to.setUTCDate(to.getUTCDate() + 6);

    to.setUTCHours(23, 59, 59, 999);

    return {
      referenceTime: reference.toISOString(),
      from: from.toISOString(),
      to: to.toISOString(),
      isRelative: true,
    };
  }

  private weekOffset(reference: Date, offset: number): TemporalContext {
    const currentWeek = this.currentWeek(reference);

    const from = new Date(currentWeek.from!);

    from.setUTCDate(from.getUTCDate() + offset * 7);

    const to = new Date(from);

    to.setUTCDate(to.getUTCDate() + 6);

    to.setUTCHours(23, 59, 59, 999);

    return {
      referenceTime: reference.toISOString(),
      from: from.toISOString(),
      to: to.toISOString(),
      isRelative: true,
    };
  }

  private currentMonth(reference: Date): TemporalContext {
    const from = new Date(
      Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1),
    );

    const to = new Date(
      Date.UTC(
        reference.getUTCFullYear(),
        reference.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );

    return {
      referenceTime: reference.toISOString(),
      from: from.toISOString(),
      to: to.toISOString(),
      isRelative: true,
    };
  }

  private monthOffset(reference: Date, offset: number): TemporalContext {
    const from = new Date(
      Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + offset, 1),
    );

    const to = new Date(
      Date.UTC(
        from.getUTCFullYear(),
        from.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );

    return {
      referenceTime: reference.toISOString(),
      from: from.toISOString(),
      to: to.toISOString(),
      isRelative: true,
    };
  }
}
