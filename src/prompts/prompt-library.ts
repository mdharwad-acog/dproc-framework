import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import createDebug from "debug";

const debug = createDebug("framework:prompt-library");

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PromptLibrary {
  private static TEMPLATES_DIR = join(__dirname, "templates");

  /**
   * Load a prompt from the library
   */
  static load(category: string, name: string): string {
    const filePath = this.getPromptPath(category, name);

    if (!existsSync(filePath)) {
      debug("Prompt not found: %s", filePath);
      throw new Error(`Prompt not found: ${category}/${name}`);
    }

    debug("Loading prompt: %s", filePath);
    return readFileSync(filePath, "utf-8");
  }

  /**
   * Load a common prompt (convenience method)
   */
  static common(name: string): string {
    return this.load("common", name);
  }

  /**
   * Load a domain-specific prompt (convenience method)
   */
  static domain(domain: string, name: string): string {
    return this.load(`domain/${domain}`, name);
  }

  /**
   * List all available prompts
   */
  static list(): Array<{ category: string; prompts: string[] }> {
    const result: Array<{ category: string; prompts: string[] }> = [];

    try {
      // List common prompts
      const commonDir = join(this.TEMPLATES_DIR, "common");
      if (existsSync(commonDir)) {
        const commonFiles = readdirSync(commonDir)
          .filter((f) => f.endsWith(".prompt.md"))
          .map((f) => f.replace(".prompt.md", ""));
        result.push({ category: "common", prompts: commonFiles });
      }

      // List domain prompts
      const domainDir = join(this.TEMPLATES_DIR, "domain");
      if (existsSync(domainDir)) {
        const domains = readdirSync(domainDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name);

        for (const domain of domains) {
          const domainPath = join(domainDir, domain);
          const domainFiles = readdirSync(domainPath)
            .filter((f) => f.endsWith(".prompt.md"))
            .map((f) => f.replace(".prompt.md", ""));
          result.push({
            category: `domain/${domain}`,
            prompts: domainFiles,
          });
        }
      }
    } catch (error: any) {
      debug("Error listing prompts: %s", error.message);
    }

    return result;
  }

  /**
   * Check if a prompt exists
   */
  static exists(category: string, name: string): boolean {
    const filePath = this.getPromptPath(category, name);
    return existsSync(filePath);
  }

  /**
   * Create a custom prompt template
   */
  static create(options: {
    role: string;
    task: string;
    constraints?: string[];
    outputFormat?: string;
    instructions?: string[];
  }): string {
    let prompt = `# Role\n${options.role}\n\n`;
    prompt += `# Task\n${options.task}\n\n`;

    if (options.constraints && options.constraints.length > 0) {
      prompt += `# Constraints\n`;
      options.constraints.forEach((c) => {
        prompt += `- ${c}\n`;
      });
      prompt += "\n";
    }

    if (options.instructions && options.instructions.length > 0) {
      prompt += `# Instructions\n`;
      options.instructions.forEach((i, idx) => {
        prompt += `${idx + 1}. ${i}\n`;
      });
      prompt += "\n";
    }

    if (options.outputFormat) {
      prompt += `# Output Format\n${options.outputFormat}\n`;
    }

    return prompt;
  }

  /**
   * Get the file path for a prompt
   */
  private static getPromptPath(category: string, name: string): string {
    // Handle both formats: 'common' and 'domain/biomedical'
    const categoryPath = category.replace(/\//g, "/");
    return join(this.TEMPLATES_DIR, categoryPath, `${name}.prompt.md`);
  }
}
