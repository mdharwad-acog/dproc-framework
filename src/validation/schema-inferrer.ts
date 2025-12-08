import { z } from "zod";

/**
 * Automatically infer Zod schemas from sample data
 * Implements Article 1: Validation Standards
 */
export class SchemaInferrer {
  /**
   * Infer schema from records
   * @param records - Array of data records
   * @param sampleSize - Number of records to analyze
   */
  inferSchema(records: any[], sampleSize: number = 100): z.ZodObject<any> {
    if (records.length === 0) {
      throw new Error("Cannot infer schema from empty dataset");
    }

    const sample = records.slice(0, Math.min(sampleSize, records.length));
    const fields: Record<string, z.ZodTypeAny> = {};

    // Get all unique keys across sample
    const allKeys = new Set<string>();
    sample.forEach((record) => {
      if (record && typeof record === "object") {
        Object.keys(record).forEach((key) => allKeys.add(key));
      }
    });

    // Infer type for each field
    allKeys.forEach((key) => {
      fields[key] = this.inferFieldType(sample, key);
    });

    return z.object(fields);
  }

  /**
   * Infer field type from sample values
   */
  private inferFieldType(sample: any[], key: string): z.ZodTypeAny {
    const values = sample
      .map((r) => r?.[key])
      .filter((v) => v !== null && v !== undefined && v !== "");

    if (values.length === 0) {
      return z.string().optional();
    }

    // Check if all values are numbers
    const numericValues = values.filter((v) => !isNaN(Number(v)));
    if (numericValues.length === values.length) {
      return z
        .union([z.number(), z.string().transform((v) => Number(v))])
        .optional();
    }

    // Check if all values are booleans
    const booleanValues = values.filter(
      (v) =>
        v === true ||
        v === false ||
        v === "1" ||
        v === "0" ||
        v === "true" ||
        v === "false" ||
        v === "yes" ||
        v === "no"
    );
    if (booleanValues.length === values.length) {
      return z
        .union([
          z.boolean(),
          z.string().transform((s) => s === "1" || s === "true" || s === "yes"),
        ])
        .optional();
    }

    // Check if values look like dates
    const dateValues = values.filter((v) => this.isDateLike(v));
    if (dateValues.length > values.length * 0.8) {
      return z.string().optional();
    }

    // Default to string
    return z.string().optional();
  }

  /**
   * Check if value looks like a date
   */
  private isDateLike(value: any): boolean {
    if (typeof value !== "string") return false;

    // Check common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}/, // ISO: 2024-01-01
      /^\d{1,2}\/\d{1,2}\/\d{4}/, // US: 01/01/2024
      /^\d{4}\/\d{2}\/\d{2}/, // Alt: 2024/01/01
      /^\d{2}-\d{2}-\d{4}/, // EU: 01-01-2024
    ];

    if (!datePatterns.some((pattern) => pattern.test(value))) {
      return false;
    }

    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  /**
   * Get human-readable description of inferred schema
   */
  describeSchema(schema: z.ZodObject<any>): Record<string, string> {
    const description: Record<string, string> = {};

    Object.entries(schema.shape).forEach(([key, zodType]) => {
      description[key] = this.describeType(zodType);
    });

    return description;
  }

  /**
   * Describe Zod type in human-readable format
   */
  private describeType(zodType: any): string {
    const typeName = zodType._def?.typeName || "unknown";

    if (typeName === "ZodUnion") {
      return "number | string (auto-coerced)";
    } else if (typeName === "ZodString") {
      return "string";
    } else if (typeName === "ZodNumber") {
      return "number";
    } else if (typeName === "ZodBoolean") {
      return "boolean";
    } else if (typeName === "ZodOptional") {
      return this.describeType(zodType._def.innerType) + " (optional)";
    }

    return "unknown";
  }
}
