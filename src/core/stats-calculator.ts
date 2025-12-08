/**
 * Calculate comprehensive statistics for any dataset
 * Implements Article 1: Grounding Bundle Standards
 */
export class StatsCalculator {
  /**
   * Calculate comprehensive statistics for dataset
   */
  calculateStats(records: any[]): Record<string, any> {
    if (records.length === 0) {
      return { record_count: 0 };
    }

    const stats: Record<string, any> = {
      record_count: records.length,
      columns: this.getColumnStats(records),
      distributions: this.getDistributions(records),
      ranges: this.getRanges(records),
    };

    return stats;
  }

  /**
   * Get statistics for each column
   */
  private getColumnStats(records: any[]): Record<string, any> {
    if (records.length === 0) return {};

    const columns: Record<string, any> = {};
    const keys = Object.keys(records[0] || {});

    keys.forEach((key) => {
      const values = records.map((r) => r[key]);
      const nonNullValues = values.filter(
        (v) => v !== null && v !== undefined && v !== ""
      );

      columns[key] = {
        null_count: values.length - nonNullValues.length,
        null_percentage:
          (
            ((values.length - nonNullValues.length) / values.length) *
            100
          ).toFixed(2) + "%",
        unique_count: new Set(nonNullValues).size,
        fill_rate:
          ((nonNullValues.length / values.length) * 100).toFixed(2) + "%",
        type: this.inferColumnType(records, key),
      };
    });

    return columns;
  }

  /**
   * Get value distributions for columns
   */
  private getDistributions(records: any[]): Record<string, any> {
    const distributions: Record<string, any> = {};

    if (records.length === 0) return distributions;

    const keys = Object.keys(records[0] || {});

    keys.forEach((key) => {
      const values = records
        .map((r) => r[key])
        .filter((v) => v !== null && v !== undefined && v !== "");

      if (values.length === 0) {
        distributions[key] = [];
        return;
      }

      // Get top 10 values by frequency
      const valueCounts = this.countValues(values);
      distributions[key] = Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([value, count]) => ({
          value: String(value),
          count,
          percentage: ((count / values.length) * 100).toFixed(2) + "%",
        }));
    });

    return distributions;
  }

  /**
   * Get ranges for numeric and date columns
   */
  private getRanges(records: any[]): Record<string, any> {
    const ranges: Record<string, any> = {};

    if (records.length === 0) return ranges;

    const keys = Object.keys(records[0] || {});

    keys.forEach((key) => {
      const values = records
        .map((r) => r[key])
        .filter((v) => v !== null && v !== undefined && v !== "");

      if (values.length === 0) return;

      // For numeric columns
      const numericValues = values.filter((v) => !isNaN(Number(v))).map(Number);

      if (
        numericValues.length > values.length * 0.8 &&
        numericValues.length > 0
      ) {
        ranges[key] = {
          type: "numeric",
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          mean: this.mean(numericValues),
          median: this.median(numericValues),
          stdDev: this.stdDev(numericValues),
        };
      }

      // For date columns
      if (
        key.toLowerCase().includes("date") ||
        key.toLowerCase().includes("time")
      ) {
        const dates = values
          .map((v) => new Date(v))
          .filter((d) => !isNaN(d.getTime()));

        if (dates.length > 0) {
          ranges[`${key}_range`] = {
            type: "date",
            earliest: new Date(
              Math.min(...dates.map((d) => d.getTime()))
            ).toISOString(),
            latest: new Date(
              Math.max(...dates.map((d) => d.getTime()))
            ).toISOString(),
            span_days: Math.ceil(
              (Math.max(...dates.map((d) => d.getTime())) -
                Math.min(...dates.map((d) => d.getTime()))) /
                (1000 * 60 * 60 * 24)
            ),
          };
        }
      }
    });

    return ranges;
  }

  /**
   * Infer column type
   */
  private inferColumnType(records: any[], key: string): string {
    const values = records
      .map((r) => r[key])
      .filter((v) => v !== null && v !== undefined && v !== "");
    if (values.length === 0) return "unknown";

    // Check numeric
    if (values.every((v) => !isNaN(Number(v)))) return "numeric";

    // Check boolean
    if (values.every((v) => typeof v === "boolean" || v === "0" || v === "1"))
      return "boolean";

    // Check date
    if (
      key.toLowerCase().includes("date") ||
      key.toLowerCase().includes("time")
    ) {
      const dates = values
        .map((v) => new Date(v))
        .filter((d) => !isNaN(d.getTime()));
      if (dates.length > values.length * 0.8) return "date";
    }

    // Check array
    if (
      values.some(
        (v) => Array.isArray(v) || (typeof v === "string" && v.includes(","))
      )
    ) {
      return "array";
    }

    return "string";
  }

  /**
   * Count occurrences of each value
   */
  private countValues(values: any[]): Map<any, number> {
    const counts = new Map();
    values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    return counts;
  }

  /**
   * Calculate mean
   */
  private mean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Calculate median
   */
  private median(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = numbers.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate standard deviation
   */
  private stdDev(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map((n) => Math.pow(n - avg, 2));
    const avgSquareDiff = this.mean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }
}
