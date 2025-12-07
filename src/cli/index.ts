#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import createDebug from "debug";
import { setupCommand } from "./commands/setup.js";
import { useCommand } from "./commands/use.js";
import { configCommand } from "./commands/config.js";
import { initCommand } from "./commands/init.js";
import { generateCommand } from "./commands/generate.js";
import { validateCommand } from "./commands/validate.js";
import { serveCommand } from "./commands/serve.js";

const debug = createDebug("framework:cli");

const program = new Command();

program
  .name("llm-framework")
  .description("LLM-powered data report generation framework")
  .version("0.1.0");

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
program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(validateCommand);
program.addCommand(serveCommand);

// Error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error: any) {
  if (
    error.code === "commander.help" ||
    error.code === "commander.helpDisplayed"
  ) {
    process.exit(0);
  }
  console.error(chalk.red("Error:"), error.message);
  debug("Full error: %O", error);
  process.exit(1);
}
