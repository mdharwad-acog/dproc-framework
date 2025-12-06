import { Command } from "commander";
import chalk from "chalk";
import { ProjectConfigLoader } from "../../core/project-config.js";
import { SecretsManager } from "../../core/secrets-manager.js";
import { ConfigManager } from "../../core/config-manager.js";
import { BundleLoader } from "../../core/bundle-loader.js";
import { AiSdkLlmClient } from "../../core/llm-client.js";
import { ReportEngine } from "../../core/report-engine.js";
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
  .action(async (options) => {
    const progress = new ProgressTracker();

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

      // Step 3: Load dataset
      progress.start("Loading dataset...");
      const dataPath = options.data || projectConfig.dataSources[0];

      if (!existsSync(dataPath)) {
        throw new Error(`Data file not found: ${dataPath}`);
      }

      const bundleLoader = new BundleLoader();
      const basicBundle = await bundleLoader.loadDataset(dataPath);

      // Validate data
      DataValidator.validateRecords(basicBundle.records);
      const columnTypes = DataValidator.inferColumnTypes(basicBundle.records);
      debug("Inferred column types: %O", columnTypes);

      progress.succeed(
        `Dataset loaded: ${basicBundle.metadata.record_count} records, ${basicBundle.stats.columnCount} columns`
      );

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

      // Step 5: Generate report with LLM
      progress.start(`Generating report with ${provider}...`);
      const llmClient = new AiSdkLlmClient(apiKey, provider, model);
      const reportEngine = new ReportEngine(llmClient);

      const markdown = await reportEngine.generate(
        projectConfig,
        enrichedBundle
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

      // Display results
      console.log(chalk.green("\n✅ Report generation complete!\n"));
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

      progress.complete();
    } catch (error: any) {
      progress.fail("Generation failed");
      console.error(chalk.red("\n❌ Error:"), error.message);
      debug("Full error: %O", error);
      process.exit(1);
    }
  });
