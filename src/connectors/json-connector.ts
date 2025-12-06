import { readFileSync } from "fs";
import createDebug from "debug";

const debug = createDebug("framework:json-connector");

export class JSONConnector {
  static load(filePath: string): any[] {
    debug("Loading JSON from: %s", filePath);

    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // Handle both array and object with array property
    const records = Array.isArray(data)
      ? data
      : data.records || data.data || [];

    debug("Loaded %d records", records.length);
    return records;
  }
}
