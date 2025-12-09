import { TextCleaner } from "./text-cleaner.js";
import { DateNormalizer } from "./date-normalizer.js";
import { NumericNormalizer } from "./numeric-normalizer.js";
import createDebug from "debug";

const debug = createDebug("framework:normalize");

/**
 * Automatically apply appropriate normalization based on field patterns
 * Implements domain-specific normalization
 */
export class AutoNormalizer {
  /**
   * Normalize a complete record
   */
  normalizeRecord(record: any): any {
    if (!record || typeof record !== "object") return record;

    debug("Normalizing record with %d fields", Object.keys(record).length);
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
    debug("Normalizing %d records", records.length);
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
      key.includes("grant") ||
      key.endsWith("_at") ||
      key.endsWith("_on")
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
      key.includes("number") ||
      key.includes("quantity") ||
      key.includes("score") ||
      key.includes("value")
    );
  }

  private isPercentField(key: string): boolean {
    return (
      key.includes("percent") ||
      key.includes("rate") ||
      key.includes("ratio") ||
      key.endsWith("_pct") ||
      key.endsWith("_rate")
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
      key.includes("categories") ||
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
        key.includes("summary") ||
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
