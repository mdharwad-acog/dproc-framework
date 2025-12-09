import { Command } from "commander";
import chalk from "chalk";
import { ProjectConfigLoader } from "../../core/project-config.js";
import { SecretsManager } from "../../core/secrets-manager.js";
import { ConfigManager } from "../../core/config-manager.js";
import { BundleLoader } from "../../core/bundle-loader.js";
import { AiSdkLlmClient } from "../../core/llm-client.js";
import {
  ReportEngine,
  ReportGenerationOptions,
} from "../../core/report-engine.js";
import { ExportManager } from "../../renderers/export-manager.js";
import { DataValidator } from "../../core/validators.js";
import { ProgressTracker } from "../utils/progress.js";
import { Provider } from "../../core/types.js";
import { existsSync, statSync } from "fs";
import createDebug from "debug";

const debug = createDebug("framework:cli:generate");

export const generateCommand = new Command("generate")
  .description("Generate report from data")
  .option("-c, --config <path>", "Path to config file")
  .option("-d, --data <path>", "Override data source path")
  .option(
    "-p, --provider <provider>",
    "Override LLM provider (gemini|openai|deepseek)"
  )
  .option("-o, --output <dir>", "Override output directory")
  .option("--no-pdf", "Skip PDF generation (faster)")

  // NEW: Phase 1 & 2 options
  .option(
    "--processing",
    "Use enhanced data processing (validation + normalization + stats)",
    true
  )
  .option("--no-processing", "Disable enhanced processing")
  .option("--prompt-library", "Enable prompt library support", true)
  .option("--no-prompt-library", "Disable prompt library")
  .option("--validate", "Validate variables before rendering", true)
  .option("--no-validate", "Skip variable validation")
  .option(
    "--context-management",
    "Manage context window for large prompts",
    true
  )
  .option("--no-context-management", "Disable context management")
  .option(
    "--structured-parsing",
    "Parse structured output (JSON, tables)",
    true
  )
  .option("--no-structured-parsing", "Disable structured parsing")
  .option("--context-size <size>", "Context window size in tokens", "8000")

  .action(async (options) => {
    const progress = new ProgressTracker();
    const startTime = Date.now();

    try {
      // Step 1: Load configuration
      progress.start("Loading configuration...");
      const projectConfig = ProjectConfigLoader.load(options.config);
      const frameworkConfig = ConfigManager.getInstance();
      progress.succeed("Configuration loaded");

      // Step 2: Get API credentials
      progress.start("Retrieving API credentials...");
      const provider = (options.provider ||
        projectConfig.llm?.provider ||
        SecretsManager.getActiveProvider()) as Provider;

      const apiKey = SecretsManager.getKeyForProvider(provider);
      const model = projectConfig.llm?.model || SecretsManager.getActiveModel();

      progress.succeed(`API credentials retrieved: ${provider} (${model})`);

      // Step 3: Load dataset with optional enhanced processing
      progress.start("Loading dataset...");
      const dataPath = options.data || projectConfig.dataSources[0];

      if (!existsSync(dataPath)) {
        throw new Error(`Data file not found: ${dataPath}`);
      }

      const bundleLoader = new BundleLoader();
      let basicBundle;

      // NEW: Use enhanced processing if enabled
      if (options.processing) {
        debug("Using enhanced data processing");
        basicBundle = await bundleLoader.loadDatasetWithProcessing(dataPath);

        // Show enhanced stats info
        const metadata = basicBundle.metadata;
        let statusMsg = `Dataset loaded: ${metadata.record_count} records, ${basicBundle.stats.columnCount} columns`;

        if (metadata.schema_id) {
          statusMsg += ` (schema: ${metadata.schema_id})`;
        }
        if (metadata.normalized) {
          statusMsg += ` [normalized]`;
        }
        if (metadata.validation) {
          const val = metadata.validation;
          if (val.invalid_records > 0) {
            statusMsg += ` [${val.invalid_records} validation warnings]`;
          }
        }

        progress.succeed(statusMsg);

        // Show enhanced stats summary
        if (basicBundle.stats.columns) {
          const colCount = Object.keys(basicBundle.stats.columns).length;
          debug("Enhanced stats available: %d columns analyzed", colCount);
        }
      } else {
        debug("Using basic data loading");
        basicBundle = await bundleLoader.loadDataset(dataPath);
        progress.succeed(
          `Dataset loaded: ${basicBundle.metadata.record_count} records, ${basicBundle.stats.columnCount} columns`
        );
      }

      // Validate data (existing)
      DataValidator.validateRecords(basicBundle.records);
      const columnTypes = DataValidator.inferColumnTypes(basicBundle.records);
      debug("Inferred column types: %O", columnTypes);

      // Step 4: Enrich bundle
      progress.start("Computing fields and formulas...");
      const enrichedBundle = bundleLoader.enrichBundle(
        basicBundle,
        projectConfig.fields?.custom,
        projectConfig.fields?.computed
      );

      const customCount = Object.keys(enrichedBundle.customFields).length;
      const computedCount = Object.keys(enrichedBundle.computedFields).length;
      progress.succeed(
        `Fields computed: ${customCount} custom, ${computedCount} computed`
      );

      // Step 5: Generate report with LLM (ENHANCED)
      progress.start(`Generating report with ${provider}...`);

      // NEW: Configure report engine with Phase 2 options
      const contextSize = parseInt(options.contextSize) || 8000;

      const reportOptions: ReportGenerationOptions = {
        usePromptLibrary: options.promptLibrary,
        validateVariables: options.validate,
        manageContext: options.contextManagement,
        parseStructured: options.structuredParsing,
        contextWindowSize: contextSize,
      };

      debug("Report generation options: %O", reportOptions);

      const llmClient = new AiSdkLlmClient(apiKey, provider, model);
      const reportEngine = new ReportEngine(llmClient, reportOptions);

      const markdown = await reportEngine.generate(
        projectConfig,
        enrichedBundle,
        reportOptions
      );

      progress.succeed("Report generated successfully");

      // Step 6: Export to multiple formats
      progress.start("Exporting to multiple formats...");
      const exportManager = new ExportManager();

      // Filter formats if --no-pdf
      let formats = projectConfig.output.formats;
      if (options.pdf === false) {
        formats = formats.filter((f) => f !== "pdf");
        progress.info("Skipping PDF generation");
      }

      const outputDir = options.output || projectConfig.output.destination;
      const outputs = await exportManager.exportAll(
        markdown,
        formats,
        outputDir
      );
      progress.succeed("Export complete");

      // Calculate elapsed time
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

      // Display results
      console.log(chalk.green("\n✅ Report generation complete!\n"));

      // Show generated files
      console.log(chalk.blue("📄 Generated files:"));
      Object.entries(outputs).forEach(([format, path]) => {
        const size = statSync(path).size;
        const sizeKB = (size / 1024).toFixed(1);
        console.log(
          `  ${chalk.cyan(format.toUpperCase().padEnd(6))} ${path} ${chalk.gray(
            `(${sizeKB} KB)`
          )}`
        );
      });

      // NEW: Show enhanced processing info if used
      if (options.processing && enrichedBundle.metadata) {
        const meta = enrichedBundle.metadata;
        console.log(chalk.blue("\n📊 Data Processing:"));

        if (meta.schema_id) {
          console.log(`  Schema ID: ${chalk.cyan(meta.schema_id)}`);
        }

        if (meta.normalized) {
          console.log(`  Normalization: ${chalk.green("✓ Applied")}`);
        }

        if (meta.validation) {
          const val = meta.validation;
          const validPercent = (
            (val.valid_records / val.total_records) *
            100
          ).toFixed(1);
          console.log(
            `  Validation: ${chalk.cyan(val.valid_records)}/${
              val.total_records
            } valid (${validPercent}%)`
          );

          if (val.invalid_records > 0) {
            console.log(
              chalk.yellow(
                `  ⚠️  ${val.invalid_records} records with validation warnings`
              )
            );
          }
        }

        if (enrichedBundle.stats.columns) {
          const colCount = Object.keys(enrichedBundle.stats.columns).length;
          console.log(
            `  Enhanced Stats: ${chalk.cyan(colCount)} columns analyzed`
          );
        }
      }

      // NEW: Show Phase 2 features used
      const featuresUsed: string[] = [];
      if (options.promptLibrary) featuresUsed.push("Prompt Library");
      if (options.validate) featuresUsed.push("Variable Validation");
      if (options.contextManagement) featuresUsed.push("Context Management");
      if (options.structuredParsing) featuresUsed.push("Structured Parsing");

      if (featuresUsed.length > 0) {
        console.log(chalk.blue("\n🚀 Features Used:"));
        featuresUsed.forEach((feature) => {
          console.log(`  ${chalk.green("✓")} ${feature}`);
        });
      }

      progress.complete();
    } catch (error: any) {
      progress.fail("Generation failed");
      console.error(chalk.red("\n❌ Error:"), error.message);
      debug("Full error: %O", error);
      process.exit(1);
    }
  });
