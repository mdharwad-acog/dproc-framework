#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import createDebug from "debug";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { setupCommand } from "./commands/setup.js";
import { useCommand } from "./commands/use.js";
import { configCommand } from "./commands/config.js";
import { generateCommand } from "./commands/generate.js";
import { listCommand } from './commands/list.js';

const debug = createDebug("framework:cli");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../../package.json"), "utf-8")
);

const program = new Command();

program
  .name("dproc") // ← Match bin name
  .description(
    "Production-ready LLM-powered data processing and report generation framework"
  )
  .version(packageJson.version);

program.option("-d, --debug", "Enable debug mode");

program.hook("preAction", (thisCommand) => {
  if (thisCommand.opts().debug) {
    process.env.DEBUG = "framework:*";
    debug.enabled = true;
  }
});

// Add commands
program.addCommand(setupCommand);
program.addCommand(useCommand);
program.addCommand(configCommand);
program.addCommand(generateCommand);
program.addCommand(listCommand);

// Error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error: any) {
  if (
    error.code === "commander.version" ||
    error.code === "commander.help" ||
    error.code === "commander.helpDisplayed"
  ) {
    process.exit(0);
  }
  console.error(chalk.red("Error:"), error.message);
  debug("Full error: %O", error);
  process.exit(1);
}
