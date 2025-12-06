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
  }): Promise<string> {
    const modelName = params.model || this.defaultModel;
    const model = this.resolveModel(modelName);

    debug("Generating text with %s...", modelName);

    try {
      const result = await generateText({
        model,
        prompt: params.prompt,
      });

      debug("Generated %d tokens", result.usage.totalTokens);
      return result.text;
    } catch (error: any) {
      debug("LLM error: %O", error);
      throw new Error(`LLM generation failed: ${error.message}`);
    }
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
}
