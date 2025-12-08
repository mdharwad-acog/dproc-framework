import { TextCleaner } from "./text-cleaner.js";
import { DateNormalizer } from "./date-normalizer.js";
import { NumericNormalizer } from "./numeric-normalizer.js";

/**
 * Automatically apply appropriate normalization based on field patterns
 * Implements Article 1: Domain-specific normalization
 */
export class AutoNormalizer {
  /**
   * Normalize a complete record
   */
  normalizeRecord(record: any): any {
    if (!record || typeof record !== "object") return record;

    const normalized: any = {};

    Object.entries(record).forEach(([key, value]) => {
      normalized[key] = this.normalizeField(key, value);
    });

    return normalized;
  }

  /**
   * Normalize multiple records
   */
  normalizeRecords(records: any[]): any[] {
    return records.map((record) => this.normalizeRecord(record));
  }

  /**
   * Normalize a single field based on key patterns and value
   */
  private normalizeField(key: string, value: any): any {
    const keyLower = key.toLowerCase();

    // Date fields
    if (this.isDateField(keyLower)) {
      return DateNormalizer.normalize(value);
    }

    // Numeric fields
    if (this.isNumericField(keyLower)) {
      return NumericNormalizer.normalize(value);
    }

    // Percentage fields
    if (this.isPercentField(keyLower)) {
      return NumericNormalizer.normalizePercent(value);
    }

    // Array fields (MeSH terms, CPC codes, etc.)
    if (this.isArrayField(keyLower, value)) {
      return this.normalizeArray(value);
    }

    // Text fields
    if (this.isTextField(keyLower, value)) {
      return keyLower.includes("abstract") || keyLower.includes("description")
        ? TextCleaner.cleanAbstract(value)
        : TextCleaner.clean(value);
    }

    // Keep as-is
    return value;
  }

  private isDateField(key: string): boolean {
    return (
      key.includes("date") ||
      key.includes("time") ||
      key.includes("created") ||
      key.includes("updated") ||
      key.includes("published") ||
      key.includes("filing") ||
      key.includes("grant")
    );
  }

  private isNumericField(key: string): boolean {
    return (
      key.includes("count") ||
      key.includes("amount") ||
      key.includes("price") ||
      key.includes("cost") ||
      key.includes("revenue") ||
      key.includes("total") ||
      key.includes("beds") ||
      key.includes("staff") ||
      key.includes("sum") ||
      key.includes("avg") ||
      key.includes("number")
    );
  }

  private isPercentField(key: string): boolean {
    return (
      key.includes("percent") ||
      key.includes("rate") ||
      key.includes("ratio") ||
      key.endsWith("_pct")
    );
  }

  private isArrayField(key: string, value: any): boolean {
    if (Array.isArray(value)) return true;

    return (
      key.includes("mesh") ||
      key.includes("cpc") ||
      key.includes("ipc") ||
      key.includes("tags") ||
      key.includes("keywords") ||
      key.includes("authors") ||
      key.includes("inventors") ||
      (typeof value === "string" &&
        (value.includes(",") || value.includes(";") || value.includes("|")))
    );
  }

  private isTextField(key: string, value: any): boolean {
    return (
      typeof value === "string" &&
      (key.includes("title") ||
        key.includes("description") ||
        key.includes("abstract") ||
        key.includes("text") ||
        key.includes("name") ||
        value.length > 50)
    );
  }

  private normalizeArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter((v) => v.length > 0);
    }

    if (typeof value === "string") {
      // Detect delimiter
      let delimiter = ",";
      if (value.includes(";")) delimiter = ";";
      else if (value.includes("|")) delimiter = "|";

      return value
        .split(delimiter)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    return [];
  }
}
