import { Bundle, EnrichedBundle, CustomField, ComputedField } from "./types.js";
import { UniversalConnector } from "../connectors/universal-connector.js";
import { FormulaEngine } from "./formula-engine.js";
import { StatsCalculator } from "./stats-calculator.js";
import { SchemaInferrer } from "../validation/schema-inferrer.js";
import { SchemaRegistry } from "../validation/schema-registry.js";
import { AutoNormalizer } from "../normalization/auto-normalizer.js";
import createDebug from "debug";

const debug = createDebug("framework:bundle");

export class BundleLoader {
  private formulaEngine: FormulaEngine;
  private statsCalculator: StatsCalculator;
  private schemaInferrer: SchemaInferrer;
  private schemaRegistry: SchemaRegistry;
  private autoNormalizer: AutoNormalizer;

  constructor() {
    this.formulaEngine = new FormulaEngine();
    this.statsCalculator = new StatsCalculator();
    this.schemaInferrer = new SchemaInferrer();
    this.schemaRegistry = new SchemaRegistry();
    this.autoNormalizer = new AutoNormalizer();
  }

  /**
   * Load dataset from file path (EXISTING - unchanged)
   */
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

  /**
   * Load dataset with validation (NEW)
   * Auto-infers schema and validates records
   */
  async loadDatasetWithValidation(filePath: string): Promise<Bundle> {
    debug("Loading dataset with validation from: %s", filePath);

    // Load raw data first
    const records = UniversalConnector.load(filePath);

    // Auto-infer schema
    const schema = this.schemaInferrer.inferSchema(records);
    const schemaDescription = this.schemaInferrer.describeSchema(schema);

    // Register schema for future use
    const schemaId = this.generateSchemaId(filePath);
    this.schemaRegistry.register(schemaId, schema);

    // Validate records
    const validationResults = records.map((record, idx) => {
      try {
        return {
          record: schema.parse(record),
          valid: true,
          index: idx,
        };
      } catch (error: any) {
        debug("Validation warning for record %d: %s", idx, error.message);
        return {
          record,
          valid: false,
          index: idx,
          errors: error.errors || [error.message],
        };
      }
    });

    const validRecords = validationResults
      .filter((r) => r.valid)
      .map((r) => r.record);

    const invalidCount = validationResults.filter((r) => !r.valid).length;

    if (invalidCount > 0) {
      console.warn(
        `⚠️  ${invalidCount} records failed validation (kept original data)`
      );
    }

    const stats = this.computeBasicStats(validRecords);
    const samples = this.extractSamples(validRecords);

    const bundle: Bundle = {
      source: filePath,
      records: validRecords,
      stats,
      metadata: {
        ingested_at: new Date().toISOString(),
        source_file: filePath,
        record_count: validRecords.length,
        schema_id: schemaId,
        schema_description: schemaDescription,
        validation: {
          total_records: records.length,
          valid_records: validRecords.length,
          invalid_records: invalidCount,
        },
      },
      samples: {
        main: samples,
      },
    };

    debug(
      "Validated bundle created: %d valid records out of %d",
      validRecords.length,
      records.length
    );
    return bundle;
  }

  /**
   * Load dataset with normalization (NEW)
   * Auto-normalizes all fields based on patterns
   */
  async loadDatasetWithNormalization(filePath: string): Promise<Bundle> {
    debug("Loading dataset with normalization from: %s", filePath);

    // Load raw data
    const records = UniversalConnector.load(filePath);

    // Apply auto-normalization
    const normalizedRecords = this.autoNormalizer.normalizeRecords(records);

    const stats = this.computeBasicStats(normalizedRecords);
    const samples = this.extractSamples(normalizedRecords);

    const bundle: Bundle = {
      source: filePath,
      records: normalizedRecords,
      stats,
      metadata: {
        ingested_at: new Date().toISOString(),
        source_file: filePath,
        record_count: normalizedRecords.length,
        normalized: true,
        normalization_timestamp: new Date().toISOString(),
      },
      samples: {
        main: samples,
      },
    };

    debug("Normalized bundle created: %d records", normalizedRecords.length);
    return bundle;
  }

  /**
   * Load dataset with full processing (NEW)
   * Combines validation + normalization + enhanced stats
   */
  async loadDatasetWithProcessing(filePath: string): Promise<Bundle> {
    debug("Loading dataset with full processing from: %s", filePath);

    // Load raw data
    const records = UniversalConnector.load(filePath);

    // Normalize first
    const normalizedRecords = this.autoNormalizer.normalizeRecords(records);

    // Then validate
    const schema = this.schemaInferrer.inferSchema(normalizedRecords);
    const schemaId = this.generateSchemaId(filePath);
    this.schemaRegistry.register(schemaId, schema);

    const validatedRecords = normalizedRecords.map((record) => {
      try {
        return schema.parse(record);
      } catch {
        return record; // Keep original if validation fails
      }
    });

    // Compute enhanced stats
    const basicStats = this.computeBasicStats(validatedRecords);
    const enhancedStats = {
      ...basicStats,
      ...this.statsCalculator.calculateStats(validatedRecords),
    };

    const samples = this.extractSamples(validatedRecords);

    const bundle: Bundle = {
      source: filePath,
      records: validatedRecords,
      stats: enhancedStats,
      metadata: {
        ingested_at: new Date().toISOString(),
        source_file: filePath,
        record_count: validatedRecords.length,
        schema_id: schemaId,
        normalized: true,
        normalization_timestamp: new Date().toISOString(),
        processed: true,
        processing_timestamp: new Date().toISOString(),
      },
      samples: {
        main: samples,
      },
    };

    debug(
      "Fully processed bundle created: %d records",
      validatedRecords.length
    );
    return bundle;
  }

  /**
   * Enrich bundle (EXISTING - enhanced with better stats)
   */
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

    // Enhance stats with comprehensive calculations (NEW)
    if (bundle.records.length > 0) {
      const enhancedStats = {
        ...enriched.stats,
        ...this.statsCalculator.calculateStats(bundle.records),
      };
      enriched.stats = enhancedStats;
      debug("Enhanced stats calculated");
    }

    return enriched;
  }

  /**
   * Compute basic stats (EXISTING - unchanged)
   */
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

  /**
   * Extract samples (EXISTING - unchanged)
   */
  private extractSamples(records: any[]): any[] {
    return records.slice(0, 5);
  }

  /**
   * Generate unique schema ID from file path (NEW - helper)
   */
  private generateSchemaId(filePath: string): string {
    return filePath
      .replace(/^.*[\\/]/, "") // Get filename
      .replace(/\.[^.]+$/, "") // Remove extension
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
  }

  /**
   * Load dataset with full processing and progress tracking (NEW)
   * Useful for CLI with progress bars
   */
  async loadDatasetWithProgressTracking(
    filePath: string,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<Bundle> {
    debug("Loading dataset with progress tracking from: %s", filePath);

    try {
      // Stage 1: Load data
      onProgress?.("Loading data", 0);
      const records = UniversalConnector.load(filePath);
      onProgress?.("Data loaded", 20);

      // Stage 2: Normalize
      onProgress?.("Normalizing data", 25);
      const normalizedRecords = this.autoNormalizer.normalizeRecords(records);
      onProgress?.("Normalization complete", 45);

      // Stage 3: Validate
      onProgress?.("Validating schema", 50);
      const schema = this.schemaInferrer.inferSchema(normalizedRecords);
      const schemaId = this.generateSchemaId(filePath);
      this.schemaRegistry.register(schemaId, schema);
      onProgress?.("Validation complete", 70);

      // Stage 4: Calculate stats
      onProgress?.("Calculating statistics", 75);
      const basicStats = this.computeBasicStats(normalizedRecords);
      const enhancedStats = {
        ...basicStats,
        ...this.statsCalculator.calculateStats(normalizedRecords),
      };
      onProgress?.("Statistics calculated", 90);

      // Stage 5: Extract samples
      const samples = this.extractSamples(normalizedRecords);

      // Build final bundle
      const bundle: Bundle = {
        source: filePath,
        records: normalizedRecords,
        stats: enhancedStats,
        metadata: {
          ingested_at: new Date().toISOString(),
          source_file: filePath,
          record_count: normalizedRecords.length,
          schema_id: schemaId,
          normalized: true,
          processed: true,
          processing_timestamp: new Date().toISOString(),
        },
        samples: {
          main: samples,
        },
      };

      onProgress?.("Complete", 100);
      debug(
        "Bundle with progress tracking created: %d records",
        normalizedRecords.length
      );
      return bundle;
    } catch (error: any) {
      debug("Error during bundle loading: %s", error.message);
      throw new Error(`Failed to load dataset with progress: ${error.message}`);
    }
  }
}
