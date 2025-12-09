import { homedir } from "os";
import { join } from "path";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  chmodSync,
} from "fs";
import createDebug from "debug";
import inquirer from "inquirer";
import { Provider } from "./types.js";

const debug = createDebug("framework:secrets");

interface ProviderConfig {
  apiKey: string;
  default_model: string;
}

interface Secrets {
  providers: Record<Provider, ProviderConfig>;
  active_provider: Provider;
}

export class SecretsManager {
  private static secretsPath = join(
    homedir(),
    ".aganitha",
    ".llm-framework",
    "secrets.json"
  );

  static async setup(): Promise<void> {
    console.log("\n🔑 API Key Setup\n");

    const secrets: Secrets = {
      providers: {
        gemini: await this.promptForProvider("Gemini", "gemini-1.5-flash"),
        openai: await this.promptForProvider("OpenAI", "gpt-4o-mini"),
        deepseek: await this.promptForProvider("DeepSeek", "deepseek-chat"),
      },
      active_provider: "gemini",
    };

    this.save(secrets);
    console.log("\n✅ API keys saved to:", this.secretsPath);
    console.log("✅ Active provider: gemini\n");
  }

  static getActiveKey(): string {
    const secrets = this.load();
    const provider = secrets.active_provider;
    const key = secrets.providers[provider].apiKey;

    if (!key) {
      throw new Error(
        `No API key configured for ${provider}. Run: dproc setup`
      );
    }

    return key;
  }

  static getActiveProvider(): Provider {
    return this.load().active_provider;
  }

  static getActiveModel(): string {
    const secrets = this.load();
    const provider = secrets.active_provider;
    return secrets.providers[provider].default_model;
  }

  static switchProvider(provider: Provider): void {
    const secrets = this.load();

    if (!secrets.providers[provider]?.apiKey) {
      throw new Error(`No API key configured for ${provider}`);
    }

    secrets.active_provider = provider;
    this.save(secrets);
    console.log(`✅ Switched to ${provider}`);
  }

  static getKeyForProvider(provider: Provider): string {
    const secrets = this.load();
    const key = secrets.providers[provider]?.apiKey;

    if (!key) {
      throw new Error(
        `No API key configured for ${provider}. Run: dproc setup`
      );
    }

    return key;
  }

  static listProviders(): void {
    const secrets = this.load();
    console.log("\n🔑 Configured Providers:\n");

    Object.entries(secrets.providers).forEach(([provider, config]) => {
      const isActive = provider === secrets.active_provider;
      const hasKey = !!config.apiKey;
      const status = hasKey ? "✅" : "❌";
      const active = isActive ? " (active)" : "";

      console.log(`  ${status} ${provider}${active}`);
      if (hasKey) {
        console.log(`      Model: ${config.default_model}`);
      }
    });

    console.log();
  }

  private static load(): Secrets {
    if (!existsSync(this.secretsPath)) {
      throw new Error("No API keys configured. Run: dproc setup");
    }

    return JSON.parse(readFileSync(this.secretsPath, "utf-8"));
  }

  private static save(secrets: Secrets): void {
    const dir = join(homedir(), ".aganitha", ".llm-framework");

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(this.secretsPath, JSON.stringify(secrets, null, 2));

    // Secure file permissions (owner read/write only)
    try {
      chmodSync(this.secretsPath, 0o600);
    } catch (err) {
      debug("Could not set file permissions: %O", err);
    }
  }

  private static async promptForProvider(
    name: string,
    defaultModel: string
  ): Promise<ProviderConfig> {
    const answers = await inquirer.prompt([
      {
        type: "password",
        name: "apiKey",
        message: `Enter your ${name} API key (or leave empty to skip):`,
        mask: "*",
      },
      {
        type: "input",
        name: "model",
        message: `Default ${name} model:`,
        default: defaultModel,
        when: (answers) => !!answers.apiKey,
      },
    ]);

    return {
      apiKey: answers.apiKey || "",
      default_model: answers.model || defaultModel,
    };
  }
}
