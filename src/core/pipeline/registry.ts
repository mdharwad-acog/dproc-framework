import * as fs from "fs/promises";
import * as path from "path";
import { PipelineConfig } from "./types";
import { findProjectRootSync } from "../utils/find-project-root";

const projectRoot = findProjectRootSync(__dirname);

if (!projectRoot) {
  throw new Error("Could not find project root. Make sure 'pnpm-workspace.yaml' or 'package.json' exists in an ancestor directory.");
}

// The directory where shared pipelines are stored.
const WORKSPACE_DIR = path.join(projectRoot, "shared/dproc-workspace");

/**
 * Discovers, validates, and manages available pipelines.
 */
export class PipelineRegistry {
  private pipelines: Map<string, PipelineConfig> = new Map();

  /**
   * Scans the workspace directory for pipeline configurations and registers them.
   */
  async scan(): Promise<void> {
    try {
      const entries = await fs.readdir(WORKSPACE_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pipelineDir = path.join(WORKSPACE_DIR, entry.name);
          const configPath = path.join(pipelineDir, "pipeline.config.ts");
          try {
            const configStat = await fs.stat(configPath);
            if (configStat.isFile()) {
              // Dynamically import the pipeline configuration.
              const configModule = await import(configPath);
              const config: PipelineConfig = configModule.default;

              // Basic validation to ensure the config has an ID.
              if (config && config.id) {
                // Store the absolute paths for processor and template.
                const fullPathConfig = {
                  ...config,
                  processor: path.resolve(pipelineDir, config.processor),
                  template: path.resolve(pipelineDir, config.template),
                };
                this.pipelines.set(config.id, fullPathConfig);
                console.log(`Registered pipeline: ${config.name}`);
              } else {
                console.warn(`Invalid pipeline config found in ${pipelineDir}`);
              }
            }
          } catch (error) {
            // Ignore directories that don't contain a pipeline.config.ts file.
            if (
              error &&
              typeof error === "object" &&
              "code" in error &&
              error.code !== "ENOENT"
            ) {
              console.error(
                `Error loading pipeline from ${pipelineDir}:`,
                error
              );
            }
          }
        }
      }
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        console.warn(
          `Workspace directory not found: ${WORKSPACE_DIR}. No pipelines will be loaded.`
        );
      } else {
        console.error("Failed to scan pipeline workspace:", error);
      }
    }
  }

  /**
   * Retrieves a single pipeline configuration by its ID.
   * @param id The ID of the pipeline to retrieve.
   * @returns The pipeline configuration, or undefined if not found.
   */
  get(id: string): PipelineConfig | undefined {
    return this.pipelines.get(id);
  }

  /**
   * Returns a list of all registered pipeline configurations.
   * @returns An array of pipeline configurations.
   */
  list(): PipelineConfig[] {
    return Array.from(this.pipelines.values());
  }
}
