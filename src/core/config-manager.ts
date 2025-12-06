import { FrameworkDefaults, FrameworkDefaultsSchema } from "./types.js";
import createDebug from "debug";

const debug = createDebug("framework:config");

export class ConfigManager {
  private static instance: ConfigManager;
  private defaults: FrameworkDefaults;

  private constructor() {
    this.defaults = FrameworkDefaultsSchema.parse({
      llm: {
        provider: "gemini",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        maxTokens: 4096,
      },
      paths: {
        prompts: "./prompts",
        templates: "./templates",
        data: "./data",
        output: "./output",
      },
    });

    debug("Framework defaults loaded: %O", this.defaults);
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getDefaults(): FrameworkDefaults {
    return this.defaults;
  }

  getLLMDefaults() {
    return this.defaults.llm;
  }

  getPathDefaults() {
    return this.defaults.paths;
  }
}
