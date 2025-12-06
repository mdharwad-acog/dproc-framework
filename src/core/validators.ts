import { z } from "zod";
import createDebug from "debug";

const debug = createDebug("framework:validator");

export class DataValidator {
  static validateRecords(records: any[], requiredColumns?: string[]): void {
    if (records.length === 0) {
      throw new Error("Dataset is empty");
    }

    const columns = Object.keys(records[0]);
    debug("Dataset columns: %o", columns);

    if (requiredColumns) {
      const missing = requiredColumns.filter((col) => !columns.includes(col));
      if (missing.length > 0) {
        throw new Error(
          `Missing required columns: ${missing.join(
            ", "
          )}\nAvailable: ${columns.join(", ")}`
        );
      }
    }
  }

  static inferColumnTypes(records: any[]): Record<string, string> {
    if (records.length === 0) return {};

    const types: Record<string, string> = {};
    const sample = records[0];

    for (const [key, value] of Object.entries(sample)) {
      if (value === null || value === undefined) {
        types[key] = "unknown";
      } else if (typeof value === "number") {
        types[key] = "number";
      } else if (typeof value === "boolean") {
        types[key] = "boolean";
      } else if (this.isDateString(String(value))) {
        types[key] = "date";
      } else {
        types[key] = "string";
      }
    }

    return types;
  }

  private static isDateString(str: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ];

    return (
      datePatterns.some((pattern) => pattern.test(str)) &&
      !isNaN(Date.parse(str))
    );
  }
}
