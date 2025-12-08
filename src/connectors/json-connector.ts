import { readFileSync } from "fs";
import { AutoNormalizer } from "../normalization/auto-normalizer.js";

export interface JsonLoadOptions {
  normalize?: boolean;
  arrayPath?: string; // JSONPath to array (e.g., "data.items")
}

export class JsonConnector {
  private normalizer = new AutoNormalizer();

  load(filePath: string, options: JsonLoadOptions = {}): any[] {
    const rawData = readFileSync(filePath, "utf-8");
    let records = JSON.parse(rawData);

    // Handle nested arrays
    if (options.arrayPath) {
      const parts = options.arrayPath.split(".");
      for (const part of parts) {
        records = records[part];
      }
    }

    // Ensure records is an array
    if (!Array.isArray(records)) {
      records = [records];
    }

    // Optional auto-normalization
    const finalRecords = options.normalize
      ? this.normalizer.normalizeRecords(records)
      : records;

    return finalRecords;
  }
}
