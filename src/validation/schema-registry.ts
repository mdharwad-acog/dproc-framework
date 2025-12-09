import { z } from "zod";
import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "fs";
import { join, dirname } from "path";
import createDebug from "debug";

const debug = createDebug("framework:schema-registry");

export interface SchemaMetadata {
  id: string;
  createdAt: string;
  updatedAt?: string;
  shape: Record<string, string>;
  recordCount?: number;
  source?: string;
}

/**
 * Store and manage inferred schemas
 */
export class SchemaRegistry {
  private schemas: Map<string, z.ZodObject<any>> = new Map();
  private metadata: Map<string, SchemaMetadata> = new Map();
  private cacheDir: string;

  constructor(cacheDir: string = ".dproc/schemas") {
    this.cacheDir = cacheDir;
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
      debug("Created schema cache directory: %s", this.cacheDir);
    }

    // Load existing schemas on init
    this.loadAllFromCache();
  }

  /**
   * Register a schema with an identifier
   */
  register(
    id: string,
    schema: z.ZodObject<any>,
    metadata?: Partial<SchemaMetadata>
  ): void {
    debug("Registering schema: %s", id);
    this.schemas.set(id, schema);

    const schemaMetadata: SchemaMetadata = {
      id,
      createdAt: metadata?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shape: this.extractShape(schema),
      recordCount: metadata?.recordCount,
      source: metadata?.source,
    };

    this.metadata.set(id, schemaMetadata);
    this.saveToCache(id, schema, schemaMetadata);
  }

  /**
   * Get a registered schema
   */
  get(id: string): z.ZodObject<any> | undefined {
    debug("Getting schema: %s", id);
    return this.schemas.get(id);
  }

  /**
   * Get schema metadata
   */
  getMetadata(id: string): SchemaMetadata | undefined {
    return this.metadata.get(id);
  }

  /**
   * Check if schema exists
   */
  has(id: string): boolean {
    return this.schemas.has(id);
  }

  /**
   * Remove a schema
   */
  delete(id: string): void {
    debug("Deleting schema: %s", id);
    this.schemas.delete(id);
    this.metadata.delete(id);
  }

  /**
   * List all registered schemas
   */
  list(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * List all schemas with metadata
   */
  listWithMetadata(): SchemaMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Clear all schemas
   */
  clear(): void {
    debug("Clearing all schemas");
    this.schemas.clear();
    this.metadata.clear();
  }

  /**
   * Extract shape description from schema
   */
  private extractShape(schema: z.ZodObject<any>): Record<string, string> {
    const shape: Record<string, string> = {};

    Object.entries(schema.shape).forEach(([key, type]) => {
      shape[key] = (type as any)._def?.typeName || "unknown";
    });

    return shape;
  }

  /**
   * Save schema metadata to cache
   */
  private saveToCache(
    id: string,
    schema: z.ZodObject<any>,
    metadata: SchemaMetadata
  ): void {
    try {
      const cachePath = this.getCachePath(id);
      const dir = dirname(cachePath);

      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(cachePath, JSON.stringify(metadata, null, 2));
      debug("Saved schema to cache: %s", cachePath);
    } catch (error: any) {
      console.warn(`Failed to cache schema ${id}:`, error.message);
      debug("Cache error: %O", error);
    }
  }

  /**
   * Load all schemas from cache
   */
  private loadAllFromCache(): void {
    try {
      if (!existsSync(this.cacheDir)) return;

      const files = readdirSync(this.cacheDir).filter((f) =>
        f.endsWith(".json")
      );

      debug("Loading %d schemas from cache", files.length);

      for (const file of files) {
        const id = file.replace(".json", "");
        this.loadFromCache(id);
      }
    } catch (error: any) {
      debug("Error loading schemas from cache: %s", error.message);
    }
  }

  /**
   * Load schema metadata from cache
   */
  private loadFromCache(id: string): void {
    try {
      const cachePath = this.getCachePath(id);
      if (!existsSync(cachePath)) return;

      const content = readFileSync(cachePath, "utf-8");
      const metadata: SchemaMetadata = JSON.parse(content);

      this.metadata.set(id, metadata);
      debug("Loaded schema metadata from cache: %s", id);
    } catch (error: any) {
      debug("Error loading schema %s: %s", id, error.message);
    }
  }

  /**
   * Get cache file path
   */
  private getCachePath(id: string): string {
    return join(this.cacheDir, `${id}.json`);
  }
}
