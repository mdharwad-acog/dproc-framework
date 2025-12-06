import { Command } from "commander";
import { SecretsManager } from "../../core/secrets-manager.js";
import { Provider } from "../../core/types.js";
import chalk from "chalk";

export const useCommand = new Command("use")
  .description("Switch active LLM provider")
  .argument("<provider>", "Provider name (gemini|openai|deepseek)")
  .action((provider: string) => {
    try {
      if (!["gemini", "openai", "deepseek"].includes(provider)) {
        console.error(
          chalk.red(
            `❌ Invalid provider: ${provider}\n   Valid options: gemini, openai, deepseek`
          )
        );
        process.exit(1);
      }

      SecretsManager.switchProvider(provider as Provider);
    } catch (error: any) {
      console.error(chalk.red("❌"), error.message);
      process.exit(1);
    }
  });
