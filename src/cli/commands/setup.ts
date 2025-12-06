import { Command } from "commander";
import { SecretsManager } from "../../core/secrets-manager.js";

export const setupCommand = new Command("setup")
  .description("Configure API keys for all LLM providers")
  .action(async () => {
    try {
      await SecretsManager.setup();
    } catch (error: any) {
      console.error("❌ Setup failed:", error.message);
      process.exit(1);
    }
  });
