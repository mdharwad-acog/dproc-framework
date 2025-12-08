import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Prompt Library - Reusable, tested prompts
 * Implements Article 2: Prompt Engineering Standards
 */
export class PromptLibrary {
  private static promptCache = new Map<string, string>();
  private static templatesDir = join(__dirname, "templates");

  /**
   * Load a prompt template from the library
   */
  static load(category: string, name: string): string {
    const cacheKey = `${category}/${name}`;

    // Check cache first
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey)!;
    }

    // Load from file
    const promptPath = join(this.templatesDir, category, `${name}.prompt.md`);

    try {
      const content = readFileSync(promptPath, "utf-8");
      this.promptCache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(`Prompt not found: ${category}/${name}`);
    }
  }

  /**
   * Get a common prompt (frequently used)
   */
  static common(
    name:
      | "summarize"
      | "extract-entities"
      | "analyze-trends"
      | "compare-items"
      | "recommendations"
  ): string {
    return this.load("common", name);
  }

  /**
   * Get a domain-specific prompt
   */
  static domain(domain: string, name: string): string {
    return this.load(`domain/${domain}`, name);
  }

  /**
   * List all available prompts
   */
  static list(): { category: string; prompts: string[] }[] {
    // This would scan the templates directory
    // For now, return predefined list
    return [
      {
        category: "common",
        prompts: [
          "summarize",
          "extract-entities",
          "analyze-trends",
          "compare-items",
          "recommendations",
        ],
      },
      {
        category: "domain/biomedical",
        prompts: ["patent-analysis", "drug-discovery"],
      },
      {
        category: "domain/financial",
        prompts: ["market-analysis", "risk-assessment"],
      },
    ];
  }

  /**
   * Create a custom prompt with best practices
   */
  static create(config: {
    role: string;
    task: string;
    context?: string;
    constraints?: string[];
    examples?: Array<{ input: string; output: string }>;
    outputFormat?: string;
  }): string {
    let prompt = "";

    // Role
    prompt += `# Role\n${config.role}\n\n`;

    // Context (optional)
    if (config.context) {
      prompt += `# Context\n${config.context}\n\n`;
    }

    // Task
    prompt += `# Task\n${config.task}\n\n`;

    // Constraints (optional)
    if (config.constraints && config.constraints.length > 0) {
      prompt += `# Constraints\n`;
      config.constraints.forEach((c) => {
        prompt += `- ${c}\n`;
      });
      prompt += "\n";
    }

    // Examples (optional)
    if (config.examples && config.examples.length > 0) {
      prompt += `# Examples\n\n`;
      config.examples.forEach((ex, idx) => {
        prompt += `## Example ${idx + 1}\n`;
        prompt += `**Input:**\n${ex.input}\n\n`;
        prompt += `**Output:**\n${ex.output}\n\n`;
      });
    }

    // Output format (optional)
    if (config.outputFormat) {
      prompt += `# Output Format\n${config.outputFormat}\n\n`;
    }

    return prompt;
  }
}
