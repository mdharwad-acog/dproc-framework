import {
  ProjectConfig,
  EnrichedBundle,
  ReportVariable,
  ReportSpec,
} from "./types.js";
import { PromptRenderer } from "./prompt-renderer.js";
import { SpecLoader } from "./spec-loader.js";
import { LLMClient } from "./types.js";
import { ExportManager } from "../renderers/export-manager.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import nunjucks from "nunjucks";
import createDebug from "debug";

const debug = createDebug("framework:report-engine");

interface ReportContext {
  [key: string]: any;
}

export class ReportEngine {
  private promptRenderer: PromptRenderer;
  private templateEnv: nunjucks.Environment;
  private exportManager: ExportManager;

  constructor(private llmClient: LLMClient) {
    this.promptRenderer = new PromptRenderer();
    this.templateEnv = nunjucks.configure({ autoescape: false });
    this.exportManager = new ExportManager();
    this.registerFilters();
  }

  private registerFilters(): void {
    // Round numbers
    this.templateEnv.addFilter("round", (num: any, decimals: number = 2) => {
      if (typeof num !== "number") return num;
      return Number(num.toFixed(decimals));
    });

    // Format numbers with commas
    this.templateEnv.addFilter("format_number", (num: any) => {
      if (typeof num !== "number") return num;
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    });

    // Format dates
    this.templateEnv.addFilter(
      "date",
      (dateStr: any, format: string = "short") => {
        if (!dateStr) return dateStr;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        if (format === "short") {
          return date.toLocaleDateString("en-US");
        } else if (format === "long") {
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
        return dateStr;
      }
    );

    // Truncate text
    this.templateEnv.addFilter("truncate", (text: any, length: number = 50) => {
      if (typeof text !== "string") return text;
      if (text.length <= length) return text;
      return text.substring(0, length) + "...";
    });

    // Capitalize
    this.templateEnv.addFilter("capitalize", (text: any) => {
      if (typeof text !== "string") return text;
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    });

    // JSON dump for debugging
    this.templateEnv.addFilter("dump", (obj: any) => {
      return JSON.stringify(obj, null, 2);
    });
  }

  async generate(
    config: ProjectConfig,
    bundle: EnrichedBundle
  ): Promise<string> {
    debug("Starting report generation: %s", config.reportName);

    // Load spec file
    debug("Loading spec file: %s", config.specFile);
    const spec = SpecLoader.load(config.specFile);

    // Build initial context
    const context: ReportContext = {
      reportName: config.reportName,
      author: config.author || "Anonymous",
      bundle,
      customFields: bundle.customFields,
      computedFields: bundle.computedFields,
      stats: bundle.stats,
      metadata: bundle.metadata,
    };

    // Execute each variable in spec
    for (const variable of spec.variables) {
      debug("Executing variable: %s", variable.name);
      const value = await this.executeVariable(variable, bundle, context);
      context[variable.name] = value;
      debug("Variable %s completed", variable.name);
    }

    // Render final template
    const templatePath = spec.templateFile;
    debug("Rendering final template: %s", templatePath);

    if (!existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    const templateContent = readFileSync(templatePath, "utf-8");
    const reportMarkdown = this.templateEnv.renderString(
      templateContent,
      context
    );

    // Ensure output directory exists
    const outputDir = config.output.destination;
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Export to all configured formats
    debug("Exporting to formats: %o", config.output.formats);
    await this.exportManager.exportAll(
      reportMarkdown,
      config.output.formats,
      outputDir
    );

    debug("Report generation complete!");
    return reportMarkdown;
  }

  private async executeVariable(
    variable: ReportVariable,
    bundle: EnrichedBundle,
    context: ReportContext
  ): Promise<any> {
    // Gather inputs
    const inputs = this.resolveInputs(variable.inputs, bundle, context);

    // Render prompt
    const prompt = await this.promptRenderer.render(
      variable.promptFile,
      inputs
    );

    // Call LLM
    const response = await this.llmClient.generateText({ prompt });

    // Parse response based on type
    return this.parseResponse(response, variable.type);
  }

  private resolveInputs(
    inputPaths: string[],
    bundle: EnrichedBundle,
    context: ReportContext
  ): any {
    const resolved: any = {};

    for (const path of inputPaths) {
      const value = this.resolvePath(path, bundle, context);
      const key = path.split(".").pop() || path;
      resolved[key] = value;
    }

    return resolved;
  }

  private resolvePath(
    path: string,
    bundle: EnrichedBundle,
    context: ReportContext
  ): any {
    const parts = path.split(".");
    let current: any = { bundle, context, ctx: context, ...context };

    for (const part of parts) {
      if (current[part] === undefined) {
        debug("Warning: path not found: %s", path);
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  private parseResponse(response: string, type: string): any {
    switch (type) {
      case "markdown":
      case "string":
        return response.trim();

      case "string_list":
        // Try to parse JSON array first
        try {
          const parsed = JSON.parse(response);
          if (Array.isArray(parsed)) return parsed;
        } catch {}

        // Fallback: split by lines/bullets
        return response
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.match(/^[-*•]\s*$/))
          .map((line) => line.replace(/^[-*•]\s*/, ""));

      case "json":
        return JSON.parse(response);

      case "number":
        return parseFloat(response);

      default:
        return response;
    }
  }
}
