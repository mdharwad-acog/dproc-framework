import { readFileSync, existsSync } from "fs";
import * as YAML from "yaml";
import createDebug from "debug";
import { ReportSpec, ReportSpecSchema } from "./types.js";

const debug = createDebug("framework:spec-loader");

export class SpecLoader {
  static load(specPath: string): ReportSpec {
    debug("Loading spec from: %s", specPath);

    if (!existsSync(specPath)) {
      throw new Error(
        `Spec file not found: ${specPath}\n` +
          `Expected a spec.yml or spec.yaml file defining report structure.`
      );
    }

    const content = readFileSync(specPath, "utf-8");

    let parsed: any;
    if (specPath.endsWith(".yml") || specPath.endsWith(".yaml")) {
      parsed = YAML.parse(content);
    } else if (specPath.endsWith(".json")) {
      parsed = JSON.parse(content);
    } else {
      throw new Error(
        `Unsupported spec format: ${specPath}\n` + `Use .yml, .yaml, or .json`
      );
    }

    try {
      const spec = ReportSpecSchema.parse(parsed);
      debug("Spec loaded successfully: %s", spec.id || "unnamed");
      debug("Variables: %d", spec.variables.length);
      return spec;
    } catch (error: any) {
      throw new Error(
        `Invalid spec file format: ${specPath}\n` +
          `Validation error: ${error.message}`
      );
    }
  }
}
