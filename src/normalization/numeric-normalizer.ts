/**
 * Numeric value normalization
 */
export class NumericNormalizer {
  /**
   * Normalize numeric value - handle currency, percentages, commas
   */
  static normalize(value: any): number | null {
    if (value === null || value === undefined || value === "") return null;

    // Already a number
    if (typeof value === "number") {
      return isNaN(value) ? null : value;
    }

    // Handle strings
    if (typeof value === "string") {
      // Remove common formatting
      const cleaned = value
        .replace(/[$€£¥₹]/g, "") // Remove currency symbols
        .replace(/,/g, "") // Remove thousands separators
        .replace(/\s/g, "") // Remove spaces
        .replace(/%$/, ""); // Remove trailing percent

      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }

    // Try to coerce
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Normalize percentage (convert to decimal)
   */
  static normalizePercent(value: any): number | null {
    if (!value) return null;

    const str = String(value).trim();
    if (str.endsWith("%")) {
      const num = this.normalize(str.slice(0, -1));
      return num !== null ? num / 100 : null;
    }

    return this.normalize(value);
  }

  /**
   * Round to specified decimal places
   */
  static round(value: number | null, decimals: number = 2): number | null {
    if (value === null) return null;
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Format number for display
   */
  static format(
    value: number | null,
    options?: Intl.NumberFormatOptions
  ): string {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", options).format(value);
  }

  /**
   * Format as currency
   */
  static formatCurrency(
    value: number | null,
    currency: string = "USD"
  ): string {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  }
}
