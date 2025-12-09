import { createReadStream, existsSync } from "fs";
import { parse } from "csv-parse";
import { AutoNormalizer } from "../normalization/auto-normalizer.js";

export interface CsvLoadOptions {
  normalize?: boolean;
  delimiter?: string;
  skipEmptyLines?: boolean;
}

export class CsvConnector {
  private normalizer = new AutoNormalizer();

  async load(filePath: string, options: CsvLoadOptions = {}): Promise<any[]> {
    if (!existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    const records: any[] = [];

    return new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: options.skipEmptyLines !== false,
            delimiter: options.delimiter || ",",
            trim: true,
            cast: true,
          })
        )
        .on("data", (row) => {
          records.push(row);
        })
        .on("end", () => {
          // Optional auto-normalization
          const finalRecords = options.normalize
            ? this.normalizer.normalizeRecords(records)
            : records;
          resolve(finalRecords);
        })
        .on("error", (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        });
    });
  }
}
