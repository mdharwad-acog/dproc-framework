/**
 * Text normalization utilities
 * Implements Article 1: Normalization Standards
 */
export class TextCleaner {
  /**
   * Clean text field - remove excess whitespace, line breaks, markup
   */
  static clean(text: string | null | undefined): string {
    if (!text || typeof text !== "string") return "";

    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n+/g, " ") // Remove line breaks
      .replace(/\r/g, "") // Remove carriage returns
      .replace(/\[.*?\]/g, "") // Remove bracketed references [1]
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\t/g, " ") // Replace tabs
      .replace(/&nbsp;/g, " ") // Replace HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }

  /**
   * Clean abstract or long text - preserves paragraphs
   */
  static cleanAbstract(text: string | null | undefined): string {
    if (!text) return "";

    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Truncate text to max length with ellipsis
   */
  static truncate(text: string, maxLength: number = 200): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }

  /**
   * Remove special characters, keep alphanumeric and spaces
   */
  static sanitize(text: string): string {
    if (!text) return "";
    return text.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();
  }

  /**
   * Normalize case - useful for matching
   */
  static normalizeCase(text: string): string {
    if (!text) return "";
    return text.toLowerCase().trim();
  }
}
