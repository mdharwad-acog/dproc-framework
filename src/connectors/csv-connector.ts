import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import createDebug from "debug";

const debug = createDebug("framework:csv-connector");

export class CSVConnector {
  static load(filePath: string): any[] {
    debug("Loading CSV from: %s", filePath);

    const content = readFileSync(filePath, "utf-8");

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      cast: true,
      cast_date: false, // We'll handle dates manually
    });

    debug("Loaded %d records", records.length);
    return records;
  }
}
