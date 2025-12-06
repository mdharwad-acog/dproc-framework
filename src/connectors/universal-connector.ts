import { extname } from "path";
import { CSVConnector } from "./csv-connector.js";
import { JSONConnector } from "./json-connector.js";
import createDebug from "debug";

const debug = createDebug("framework:universal-connector");

export class UniversalConnector {
  static load(filePath: string): any[] {
    const ext = extname(filePath).toLowerCase();
    debug("Detected file type: %s", ext);

    switch (ext) {
      case ".csv":
        return CSVConnector.load(filePath);
      case ".json":
        return JSONConnector.load(filePath);
      default:
        throw new Error(
          `Unsupported file format: ${ext}. Supported: .csv, .json`
        );
    }
  }
}
