import { Command } from "commander";
import chalk from "chalk";
import { UniversalConnector } from "../../connectors/universal-connector.js";
import { DataValidator } from "../../core/validators.js";

export const validateCommand = new Command("validate")
  .description("Validate a dataset before generating reports")
  .argument("<file>", "Path to data file")
  .action(async (file: string) => {
    try {
      console.log(chalk.blue(`\n🔍 Validating: ${file}\n`));

      const records = UniversalConnector.load(file);
      console.log(chalk.green("✓ File loaded successfully"));
      console.log(chalk.cyan(`  Records: ${records.length}`));

      if (records.length === 0) {
        console.log(chalk.red("\n❌ Dataset is empty\n"));
        process.exit(1);
      }

      const columns = Object.keys(records[0]);
      console.log(chalk.cyan(`  Columns: ${columns.length}`));
      console.log(chalk.gray(`  ${columns.join(", ")}\n`));

      const types = DataValidator.inferColumnTypes(records);
      console.log(chalk.blue("📊 Column Types:"));

      Object.entries(types).forEach(([col, type]) => {
        const icon = type === "number" ? "🔢" : type === "date" ? "📅" : "📝";
        console.log(`  ${icon} ${col.padEnd(20)} ${chalk.gray(type)}`);
      });

      console.log(chalk.green("\n✅ Validation passed!\n"));
    } catch (error: any) {
      console.error(chalk.red("\n❌ Validation failed:"), error.message);
      process.exit(1);
    }
  });
