import { readFileSync } from "fs";
import { parse as parseSync } from "csv-parse/sync";
import { CsvConnector, CsvLoadOptions } from "./csv-connector.js";
import { JsonConnector, JsonLoadOptions } from "./json-connector.js";

type LoadOptions = CsvLoadOptions | JsonLoadOptions;

export class UniversalConnector {
  private static csvConnector = new CsvConnector();
  private static jsonConnector = new JsonConnector();

  /**
   * Load dataset from file (synchronous)
   */
  static load(filePath: string): any[] {
    const ext = filePath.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "csv":
        return this.loadCsvSync(filePath);

      case "json":
        return this.jsonConnector.load(filePath);

      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  /**
   * Load dataset with options (async)
   */
  static async loadWithOptions(
    filePath: string,
    options: LoadOptions = {}
  ): Promise<any[]> {
    const ext = filePath.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "csv":
        return this.csvConnector.load(filePath, options as CsvLoadOptions);

      case "json":
        return this.jsonConnector.load(filePath, options as JsonLoadOptions);

      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  /**
   * Synchronous CSV load (ES module compatible)
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
