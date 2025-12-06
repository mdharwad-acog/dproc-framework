import { Bundle, EnrichedBundle, CustomField, ComputedField } from "./types.js";
import { UniversalConnector } from "../connectors/universal-connector.js";
import { FormulaEngine } from "./formula-engine.js";
import createDebug from "debug";

const debug = createDebug("framework:bundle");

export class BundleLoader {
  private formulaEngine: FormulaEngine;

  constructor() {
    this.formulaEngine = new FormulaEngine();
  }

  async loadDataset(filePath: string): Promise<Bundle> {
    debug("Loading dataset from: %s", filePath);

    const records = UniversalConnector.load(filePath);
    const stats = this.computeBasicStats(records);
    const samples = this.extractSamples(records);

    const bundle: Bundle = {
      source: filePath,
      records,
      stats,
      metadata: {
        ingested_at: new Date().toISOString(),
        source_file: filePath,
        record_count: records.length,
      },
      samples: {
        main: samples,
      },
    };

    debug("Basic bundle created: %d records", records.length);
    return bundle;
  }

  enrichBundle(
    bundle: Bundle,
    customFields?: CustomField[],
    computedFields?: ComputedField[]
  ): EnrichedBundle {
    debug("Enriching bundle with custom/computed fields");

    const enriched: EnrichedBundle = {
      ...bundle,
      customFields: {},
      computedFields: {},
    };

    if (customFields) {
      for (const field of customFields) {
        enriched.customFields[field.name] = field.value;
      }
      debug("Added %d custom fields", customFields.length);
    }

    if (computedFields) {
      for (const field of computedFields) {
        try {
          enriched.computedFields[field.name] = this.formulaEngine.evaluate(
            field.function,
            bundle.records
          );
        } catch (error: any) {
          debug("Formula error for %s: %s", field.name, error.message);
          throw new Error(`Formula '${field.name}' failed: ${error.message}`);
        }
      }
      debug("Added %d computed fields", computedFields.length);
    }

    return enriched;
  }

  private computeBasicStats(records: any[]): Record<string, any> {
    if (records.length === 0) return {};

    const stats: Record<string, any> = {
      rowCount: records.length,
      columnCount: Object.keys(records[0]).length,
      columns: Object.keys(records[0]),
    };

    const columns = Object.keys(records[0]);
    for (const col of columns) {
      const values = records.map((r) => r[col]).filter((v) => v != null);
      const numericValues = values.filter(
        (v) => typeof v === "number" || !isNaN(parseFloat(v))
      );

      if (numericValues.length > 0) {
        const nums = numericValues.map((v) => parseFloat(v));
        stats[col] = {
          type: "numeric",
          count: nums.length,
          sum: nums.reduce((a, b) => a + b, 0),
          mean: nums.reduce((a, b) => a + b, 0) / nums.length,
          min: Math.min(...nums),
          max: Math.max(...nums),
        };
      } else {
        stats[col] = {
          type: "categorical",
          count: values.length,
          unique: new Set(values).size,
          sample: values.slice(0, 3),
        };
      }
    }

    return stats;
  }

  private extractSamples(records: any[]): any[] {
    return records.slice(0, 5);
  }
}
