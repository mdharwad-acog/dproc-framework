/**
 * Date normalization utilities
 */
export class DateNormalizer {
  /**
   * Normalize date to ISO-8601 format
   */
  static normalize(dateStr: string | Date | null | undefined): string | null {
    if (!dateStr) return null;

    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Normalize to date-only string (YYYY-MM-DD)
   */
  static toDateString(
    dateStr: string | Date | null | undefined
  ): string | null {
    const iso = this.normalize(dateStr);
    if (!iso) return null;
    return iso.split("T")[0];
  }

  /**
   * Extract year from date
   */
  static extractYear(dateStr: string | Date | null | undefined): number | null {
    const iso = this.normalize(dateStr);
    if (!iso) return null;
    return new Date(iso).getFullYear();
  }

  /**
   * Parse various date formats
   */
  static parse(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Try ISO format first
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // Try common formats
    const formats = [
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // DD-MM-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      // YYYY.MM.DD
      /^(\d{4})\.(\d{2})\.(\d{2})$/,
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const [, p1, p2, p3] = match;
        // Try both interpretations
        date = new Date(`${p3}-${p2}-${p1}`);
        if (!isNaN(date.getTime())) return date;

        date = new Date(`${p1}-${p2}-${p3}`);
        if (!isNaN(date.getTime())) return date;
      }
    }

    return null;
  }

  /**
   * Format date for display
   */
  static format(
    dateStr: string | Date | null | undefined,
    locale: string = "en-US"
  ): string {
    const iso = this.normalize(dateStr);
    if (!iso) return "N/A";

    return new Date(iso).toLocaleDateString(locale);
  }
}
