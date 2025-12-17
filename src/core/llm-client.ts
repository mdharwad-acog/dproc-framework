import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import createDebug from "debug";

const debug = createDebug("framework:llm");

type Provider = "gemini" | "openai" | "deepseek";

/**
 * A generic client for interacting with Large Language Models (LLMs).
 * It supports multiple providers and handles retries with exponential backoff.
 */
export class LlmClient {
  private apiKey: string;
  private provider: Provider;
  private defaultModel: string;

  // In a real app, these would come from a config file.
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || "";
    this.provider = "gemini";
    this.defaultModel = "gemini-2.5-flash";
    debug(`LLM client initialized for provider: ${this.provider}`);
  }

  /**
   * Generates text using the configured LLM.
   * @param prompt The prompt to send to the model.
   * @returns The generated text.
   */
  async generateText(prompt: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = this.resolveModel();
        debug(`Generating text (attempt ${attempt}/${maxRetries})...`);

        const result = await generateText({
          model,
          prompt: prompt,
        });

        debug(`Generated ${result.usage.totalTokens} tokens`);
        return result.text;
      } catch (error: any) {
        lastError = error;
        debug(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
    throw new Error(
      `LLM generation failed after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  private resolveModel() {
    switch (this.provider) {
      case "gemini": {
        const google = createGoogleGenerativeAI({ apiKey: this.apiKey });
        return google(this.defaultModel);
      }
      case "openai": {
        const openai = createOpenAI({ apiKey: this.apiKey });
        return openai(this.defaultModel);
      }
      case "deepseek": {
        const deepseek = createOpenAI({
          apiKey: this.apiKey,
          baseURL: "https://api.deepseek.com/v1",
        });
        return deepseek(this.defaultModel);
      }
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }
}
