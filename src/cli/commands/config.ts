import { Command } from "commander";
import { SecretsManager } from "../../core/secrets-manager.js";

export const configCommand = new Command("config").description(
  "Manage configuration"
);

configCommand
  .command("list")
  .description("List configured providers")
  .action(() => {
    try {
      SecretsManager.listProviders();
    } catch (error: any) {
      console.error("❌", error.message);
      process.exit(1);
    }
  });
