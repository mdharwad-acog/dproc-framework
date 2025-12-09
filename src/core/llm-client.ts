import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { Provider, LLMClient } from "./types.js";
import createDebug from "debug";

const debug = createDebug("framework:llm");

export class AiSdkLlmClient implements LLMClient {
  constructor(
    private apiKey: string,
    private provider: Provider,
    private defaultModel: string
  ) {
    debug("LLM client initialized: %s (%s)", provider, defaultModel);
  }

  async generateText(params: {
    prompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    retries?: number;
  }): Promise<string> {
    const modelName = params.model || this.defaultModel;
    const maxRetries = params.retries ?? 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = this.resolveModel(modelName);
        debug(
          "Generating text with %s (attempt %d/%d)...",
          modelName,
          attempt,
          maxRetries
        );

        const result = await generateText({
          model,
          prompt: params.prompt,
          temperature: params.temperature ?? 0.7,
          maxOutputTokens: params.maxTokens ?? 4096,
        });

        debug("Generated %d tokens", result.usage.totalTokens);
        return result.text;
      } catch (error: any) {
        lastError = error;
        debug("Attempt %d failed: %s", attempt, error.message);

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          debug("Non-retryable error detected, aborting");
          throw new Error(`LLM generation failed: ${error.message}`);
        }

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          debug("Retrying in %dms...", delay);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `LLM generation failed after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  private resolveModel(modelName: string) {
    switch (this.provider) {
      case "gemini": {
        const google = createGoogleGenerativeAI({
          apiKey: this.apiKey,
        });
        return google(modelName);
      }

      case "openai": {
        const openai = createOpenAI({
          apiKey: this.apiKey,
        });
        return openai(modelName);
      }

      case "deepseek": {
        const deepseek = createOpenAI({
          apiKey: this.apiKey,
          baseURL: "https://api.deepseek.com/v1",
        });
        return deepseek(modelName);
      }

      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private isNonRetryableError(error: any): boolean {
    const message = error.message?.toLowerCase() || "";

    // Don't retry on:
    // - Invalid API key
    // - Invalid model
    // - Content policy violations
    // - Quota exceeded (different from rate limit)
    return (
      message.includes("invalid api key") ||
      message.includes("invalid model") ||
      message.includes("authentication") ||
      message.includes("content policy") ||
      message.includes("quota exceeded")
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
