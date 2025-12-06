import { readFileSync, existsSync } from "fs";
import { join } from "path";
import createDebug from "debug";
import { ProjectConfig, ProjectConfigSchema } from "./types.js";
import * as YAML from "yaml";

const debug = createDebug("framework:project-config");

export class ProjectConfigLoader {
  static load(configPath?: string): ProjectConfig {
    const path = configPath || join(process.cwd(), "llm-framework.config.json");

    if (!existsSync(path)) {
      throw new Error(
        `Project config not found at ${path}.\nRun 'llm-framework init' to create one.`
      );
    }

    debug("Loading project config from: %s", path);

    const raw = readFileSync(path, "utf-8");
    const parsed =
      path.endsWith(".yml") || path.endsWith(".yaml")
        ? YAML.parse(raw)
        : JSON.parse(raw);

    const config = ProjectConfigSchema.parse(parsed);
    debug("Project config loaded successfully");

    return config;
  }
}
