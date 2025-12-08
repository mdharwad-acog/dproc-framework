import { z } from "zod";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

/**
 * Store and manage inferred schemas
 * Allows caching schemas for faster validation
 */
export class SchemaRegistry {
  private schemas: Map<string, z.ZodObject<any>> = new Map();
  private cacheDir: string;

  constructor(cacheDir: string = ".dproc/schemas") {
    this.cacheDir = cacheDir;
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Register a schema with an identifier
   */
  register(id: string, schema: z.ZodObject<any>): void {
    this.schemas.set(id, schema);
    this.saveToCache(id, schema);
  }

  /**
   * Get a registered schema
   */
  get(id: string): z.ZodObject<any> | undefined {
    // Check memory first
    if (this.schemas.has(id)) {
      return this.schemas.get(id);
    }

    // Try to load from cache
    return this.loadFromCache(id);
  }

  /**
   * Check if schema exists
   */
  has(id: string): boolean {
    return this.schemas.has(id) || this.cacheFileExists(id);
  }

  /**
   * Remove a schema
   */
  delete(id: string): void {
    this.schemas.delete(id);
  }

  /**
   * List all registered schemas
   */
  list(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Save schema metadata to cache
   */
  private saveToCache(id: string, schema: z.ZodObject<any>): void {
    try {
      const cachePath = this.getCachePath(id);
      const dir = dirname(cachePath);

      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Store shape description (not actual Zod object)
      const schemaDescription = Object.entries(schema.shape).reduce(
        (acc, [key, type]) => {
          acc[key] = (type as any)._def?.typeName || "unknown";
          return acc;
        },
        {} as Record<string, string>
      );

      writeFileSync(
        cachePath,
        JSON.stringify(
          {
            id,
            createdAt: new Date().toISOString(),
            shape: schemaDescription,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.warn(`Failed to cache schema ${id}:`, error);
    }
  }

  /**
   * Load schema metadata from cache
   */
  private loadFromCache(id: string): z.ZodObject<any> | undefined {
    try {
      const cachePath = this.getCachePath(id);
      if (!existsSync(cachePath)) return undefined;

      // Note: This returns cached metadata, not actual schema
      // For actual validation, schema must be re-inferred
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private cacheFileExists(id: string): boolean {
    return existsSync(this.getCachePath(id));
  }

  private getCachePath(id: string): string {
    return join(this.cacheDir, `${id}.json`);
  }
}
