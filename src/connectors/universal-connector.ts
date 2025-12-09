import { readFileSync, existsSync } from "fs";
import { parse as parseSync } from "csv-parse/sync";
import { CsvConnector, CsvLoadOptions } from "./csv-connector.js";
import { JsonConnector, JsonLoadOptions } from "./json-connector.js";

type LoadOptions = CsvLoadOptions | JsonLoadOptions;

export class UniversalConnector {
  private static csvConnector = new CsvConnector();
  private static jsonConnector = new JsonConnector();

  /**
   * Load dataset from file (synchronous)
   * @throws Error if file doesn't exist or format unsupported
   */
  static load(filePath: string): any[] {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = filePath.split(".").pop()?.toLowerCase();

    try {
      switch (ext) {
        case "csv":
          return this.loadCsvSync(filePath);
        case "json":
          return this.jsonConnector.load(filePath);
        default:
          throw new Error(
            `Unsupported file format: .${ext}\n` +
              `Supported formats: .csv, .json`
          );
      }
    } catch (error: any) {
      // Re-throw with better context if not already formatted
      if (
        error.message.includes("File not found") ||
        error.message.includes("Unsupported")
      ) {
        throw error;
      }
      throw new Error(`Failed to load ${filePath}: ${error.message}`);
    }
  }

  /**
   * Load dataset with options (async)
   * @throws Error if file doesn't exist or format unsupported
   */
  static async loadWithOptions(
    filePath: string,
    options: LoadOptions = {}
  ): Promise<any[]> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = filePath.split(".").pop()?.toLowerCase();

    try {
      switch (ext) {
        case "csv":
          return this.csvConnector.load(filePath, options as CsvLoadOptions);
        case "json":
          return this.jsonConnector.load(filePath, options as JsonLoadOptions);
        default:
          throw new Error(
            `Unsupported file format: .${ext}\n` +
              `Supported formats: .csv, .json`
          );
      }
    } catch (error: any) {
      if (
        error.message.includes("File not found") ||
        error.message.includes("Unsupported")
      ) {
        throw error;
      }
      throw new Error(`Failed to load ${filePath}: ${error.message}`);
    }
  }

  /**
   * Synchronous CSV load (ES module compatible)
   * @private
   */
  private static loadCsvSync(filePath: string): any[] {
    const content = readFileSync(filePath, "utf-8");
    const records = parseSync(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: true,
    });
    return records;
  }
}
