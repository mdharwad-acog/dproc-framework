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
import { ContextManager } from "./context-manager.js";
import { VariableValidator } from "./variable-validator.js";
import { PromptLibrary } from "../prompts/prompt-library.js";
import { PromptComposer } from "../prompts/prompt-composer.js";
import { StructuredParser } from "../prompts/structured-parser.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import nunjucks from "nunjucks";
import createDebug from "debug";

const debug = createDebug("framework:report-engine");

interface ReportContext {
  [key: string]: any;
}

export interface ReportGenerationOptions {
  usePromptLibrary?: boolean; // Use prompt library for prompts starting with 'library:'
  validateVariables?: boolean; // Validate variables before rendering
  manageContext?: boolean; // Manage context window for large prompts
  parseStructured?: boolean; // Parse structured output (JSON, tables, lists)
  contextWindowSize?: number; // Max tokens for context (default: 8000)
}

export class ReportEngine {
  private promptRenderer: PromptRenderer;
  private templateEnv: nunjucks.Environment;
  private exportManager: ExportManager;
  private contextManager: ContextManager;
  private defaultOptions: ReportGenerationOptions;

  constructor(private llmClient: LLMClient, options?: ReportGenerationOptions) {
    this.promptRenderer = new PromptRenderer();
    this.templateEnv = nunjucks.configure({ autoescape: false });
    this.exportManager = new ExportManager();

    // Initialize context manager
    const contextWindowSize = options?.contextWindowSize || 8000;
    this.contextManager = new ContextManager(contextWindowSize);

    // Set default options
    this.defaultOptions = {
      usePromptLibrary: true,
      validateVariables: true,
      manageContext: true,
      parseStructured: true,
      contextWindowSize: 8000,
      ...options,
    };

    this.registerFilters();
    debug("ReportEngine initialized with options: %o", this.defaultOptions);
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

    // NEW: Format percentage
    this.templateEnv.addFilter("percent", (num: any, decimals: number = 1) => {
      if (typeof num !== "number") return num;
      return (num * 100).toFixed(decimals) + "%";
    });

    // NEW: List join
    this.templateEnv.addFilter(
      "join",
      (arr: any[], separator: string = ", ") => {
        if (!Array.isArray(arr)) return arr;
        return arr.join(separator);
      }
    );

    // NEW: Extract first N items
    this.templateEnv.addFilter("first", (arr: any[], n: number = 5) => {
      if (!Array.isArray(arr)) return arr;
      return arr.slice(0, n);
    });

    // NEW: Sort array
    this.templateEnv.addFilter(
      "sort",
      (arr: any[], key?: string, reverse: boolean = false) => {
        if (!Array.isArray(arr)) return arr;
        const sorted = [...arr].sort((a, b) => {
          const valA = key ? a[key] : a;
          const valB = key ? b[key] : b;
          if (valA < valB) return reverse ? 1 : -1;
          if (valA > valB) return reverse ? -1 : 1;
          return 0;
        });
        return sorted;
      }
    );
  }

  /**
   * Generate report (ENHANCED with Phase 2 features)
   */
  async generate(
    config: ProjectConfig,
    bundle: EnrichedBundle,
    options?: ReportGenerationOptions
  ): Promise<string> {
    debug("Starting report generation: %s", config.reportName);

    // Merge options
    const opts = { ...this.defaultOptions, ...options };
    debug("Using options: %o", opts);

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

      // NEW: Add enhanced stats if available
      column_stats: bundle.stats?.columns,
      distributions: bundle.stats?.distributions,
      ranges: bundle.stats?.ranges,

      // NEW: Add convenience accessors
      record_count: bundle.metadata.record_count,
      schema_id: bundle.metadata.schema_id,
      normalized: bundle.metadata.normalized,
      processed: bundle.metadata.processed,
    };

    // Execute each variable in spec
    for (const variable of spec.variables) {
      debug("Executing variable: %s", variable.name);

      try {
        const value = await this.executeVariable(
          variable,
          bundle,
          context,
          opts
        );
        context[variable.name] = value;
        debug(
          "Variable %s completed: %d chars",
          variable.name,
          String(value).length
        );
      } catch (error: any) {
        console.error(
          `❌ Failed to generate variable ${variable.name}: ${error.message}`
        );
        context[variable.name] = `[Error: ${error.message}]`;
      }
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

  /**
   * Execute a single variable (ENHANCED with Phase 2 features)
   */
  private async executeVariable(
    variable: ReportVariable,
    bundle: EnrichedBundle,
    context: ReportContext,
    options: ReportGenerationOptions
  ): Promise<any> {
    // Gather inputs
    const inputs = this.resolveInputs(variable.inputs, bundle, context);

    // NEW: Validate variables if enabled
    if (options.validateVariables) {
      const validation = this.validateInputs(variable, inputs);
      if (!validation.valid) {
        console.warn(
          `⚠️  Variable validation warnings for ${variable.name}:`,
          validation.errors
        );
      }
    }

    // NEW: Load prompt (from library or file)
    let promptTemplate: string;

    if (
      options.usePromptLibrary &&
      variable.promptFile.startsWith("library:")
    ) {
      // Load from prompt library
      const parts = variable.promptFile.split(":");
      if (parts.length !== 3) {
        throw new Error(
          `Invalid library prompt format: ${variable.promptFile}. Expected: library:category:name`
        );
      }

      const [, category, name] = parts;
      promptTemplate = PromptLibrary.load(category, name);
      debug("Loaded prompt from library: %s/%s", category, name);
    } else {
      // Load from file (existing behavior)
      promptTemplate = await this.promptRenderer.loadPromptFile(
        variable.promptFile
      );
      debug("Loaded prompt from file: %s", variable.promptFile);
    }

    // Render prompt with inputs
    const prompt = this.promptRenderer.renderString(promptTemplate, inputs);

    // NEW: Manage context window if enabled
    let finalPrompt = prompt;
    if (options.manageContext) {
      const reserveTokens = 2000; // Reserve for output

      if (!this.contextManager.fitsInContext(prompt, reserveTokens)) {
        debug("Prompt too large (%d chars), managing context", prompt.length);

        // Try chunking by paragraphs first
        const chunks = this.contextManager.chunkByParagraphs(
          prompt,
          reserveTokens
        );

        if (chunks.length > 1) {
          console.warn(
            `⚠️  Prompt for ${variable.name} split into ${chunks.length} chunks. Using first chunk only.`
          );
          finalPrompt = chunks[0];
        } else {
          // Fallback to truncation
          finalPrompt = this.contextManager.truncate(prompt, reserveTokens);
          console.warn(
            `⚠️  Prompt for ${variable.name} truncated to fit context window`
          );
        }

        debug(
          "Context usage: %d%%",
          this.contextManager.getContextUsage(finalPrompt).toFixed(1)
        );
      }
    }

    // Call LLM
    debug("Calling LLM for variable: %s", variable.name);
    const response = await this.llmClient.generateText({ prompt: finalPrompt });
    debug("LLM response received: %d chars", response.length);

    // NEW: Parse response with structured parser if enabled
    if (options.parseStructured) {
      return this.parseResponseStructured(
        response,
        variable.type,
        variable.name
      );
    } else {
      // Use existing parser
      return this.parseResponse(response, variable.type);
    }
  }

  /**
   * Validate inputs before rendering (NEW)
   */
  private validateInputs(
    variable: ReportVariable,
    inputs: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if inputs is an object
    if (typeof inputs !== "object" || inputs === null) {
      errors.push(`Inputs for ${variable.name} is not an object`);
      return { valid: false, errors };
    }

    // Check for required common fields
    const commonFields = ["bundle", "stats", "metadata"];
    commonFields.forEach((field) => {
      if (
        variable.inputs.some((input) => input.includes(field)) &&
        !inputs[field]
      ) {
        errors.push(`Missing expected field: ${field}`);
      }
    });

    // Check for empty strings
    Object.entries(inputs).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim().length === 0) {
        errors.push(`Empty string value for: ${key}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Parse response using structured parser (NEW)
   */
  private parseResponseStructured(
    response: string,
    type: string,
    variableName: string
  ): any {
    try {
      switch (type) {
        case "markdown":
        case "string":
          return response.trim();

        case "string_list":
          // Try structured parser first
          try {
            return StructuredParser.extractList(response);
          } catch {
            // Fallback to original method
            return this.parseResponse(response, type);
          }

        case "json":
          // Use structured parser to extract JSON
          return StructuredParser.extractJSON(response);

        case "number":
          const num = parseFloat(response.trim());
          if (isNaN(num)) {
            console.warn(
              `⚠️  Could not parse number from response for ${variableName}`
            );
            return 0;
          }
          return num;

        default:
          return response.trim();
      }
    } catch (error: any) {
      console.error(
        `❌ Failed to parse ${type} response for ${variableName}: ${error.message}`
      );
      // Return raw response as fallback
      return response;
    }
  }

  /**
   * Resolve inputs from paths (EXISTING - kept for compatibility)
   */
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

    // NEW: Always include bundle and context
    resolved.bundle = bundle;
    resolved.context = context;
    resolved.stats = bundle.stats;
    resolved.metadata = bundle.metadata;

    return resolved;
  }

  /**
   * Resolve path from bundle/context (EXISTING - unchanged)
   */
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

  /**
   * Parse response (EXISTING - kept for fallback)
   */
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

  /**
   * Generate report using prompt library (NEW convenience method)
   */
  async generateWithLibrary(
    bundle: EnrichedBundle,
    promptCategory: string,
    promptName: string,
    outputTemplate: string,
    config: Partial<ProjectConfig> = {}
  ): Promise<string> {
    debug(
      "Generating report with library prompt: %s/%s",
      promptCategory,
      promptName
    );

    // Load prompt from library
    const promptTemplate = PromptLibrary.load(promptCategory, promptName);

    // Build context
    const context: ReportContext = {
      reportName: config.reportName || "Report",
      author: config.author || "Anonymous",
      bundle,
      dataset_name: bundle.source,
      record_count: bundle.records.length,
      column_count: bundle.stats?.columnCount || 0,
      data_sample: JSON.stringify(bundle.samples.main.slice(0, 3), null, 2),
      stats: bundle.stats,
      metadata: bundle.metadata,
      customFields: bundle.customFields,
      computedFields: bundle.computedFields,
    };

    // Render and call LLM
    const prompt = this.promptRenderer.renderString(promptTemplate, context);
    const analysis = await this.llmClient.generateText({ prompt });

    // Load output template
    if (!existsSync(outputTemplate)) {
      throw new Error(`Template file not found: ${outputTemplate}`);
    }

    const templateContent = readFileSync(outputTemplate, "utf-8");
    const markdown = this.templateEnv.renderString(templateContent, {
      analysis,
      ...context,
    });

    return markdown;
  }

  /**
   * Generate report with multi-step prompts (NEW)
   */
  async generateMultiStep(
    bundle: EnrichedBundle,
    steps: Array<{
      category: string;
      name: string;
      inputs?: Record<string, any>;
    }>,
    outputTemplate: string,
    config: Partial<ProjectConfig> = {}
  ): Promise<string> {
    debug("Generating multi-step report with %d steps", steps.length);

    const context: ReportContext = {
      reportName: config.reportName || "Multi-Step Report",
      author: config.author || "Anonymous",
      bundle,
      dataset_name: bundle.source,
      record_count: bundle.records.length,
      data_sample: JSON.stringify(bundle.samples.main.slice(0, 3), null, 2),
      stats: bundle.stats,
      metadata: bundle.metadata,
    };

    // Execute each step
    const stepResults: Record<string, any> = {};

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      debug("Executing step %d: %s/%s", i + 1, step.category, step.name);

      const promptTemplate = PromptLibrary.load(step.category, step.name);

      // Merge step inputs with context and previous results
      const stepContext = {
        ...context,
        ...stepResults,
        ...step.inputs,
      };

      const prompt = this.promptRenderer.renderString(
        promptTemplate,
        stepContext
      );
      const result = await this.llmClient.generateText({ prompt });

      const resultKey = `step_${i + 1}_${step.name}`;
      stepResults[resultKey] = result;
      debug("Step %d complete: %d chars", i + 1, result.length);
    }

    // Render final template with all step results
    if (!existsSync(outputTemplate)) {
      throw new Error(`Template file not found: ${outputTemplate}`);
    }

    const templateContent = readFileSync(outputTemplate, "utf-8");
    const markdown = this.templateEnv.renderString(templateContent, {
      ...context,
      ...stepResults,
    });

    return markdown;
  }
}
