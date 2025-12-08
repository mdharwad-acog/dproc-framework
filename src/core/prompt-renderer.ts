import { existsSync, readFileSync } from "fs";
import { join } from "path";
import nunjucks from "nunjucks";
import createDebug from "debug";

const debug = createDebug("framework:prompt");

export class PromptRenderer {
  private env: nunjucks.Environment;

  constructor() {
    this.env = nunjucks.configure({ autoescape: false });
    this.registerFilters();
  }

  private registerFilters(): void {
    // Round numbers
    this.env.addFilter("round", (num: any, decimals: number = 2) => {
      if (typeof num !== "number") return num;
      return Number(num.toFixed(decimals));
    });

    // Format numbers with commas
    this.env.addFilter("format_number", (num: any) => {
      if (typeof num !== "number") return num;
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    });
  }

  async render(promptPath: string, context: any): Promise<string> {
    debug("Rendering prompt: %s", promptPath);

    const templateContent = readFileSync(promptPath, "utf-8");
    const rendered = this.env.renderString(templateContent, context);

    debug("Prompt rendered: %d characters", rendered.length);
    return rendered;
  }

  renderString(template: string, context: any): string {
    return this.env.renderString(template, context);
  }

  // Add these methods to your existing PromptRenderer class

  /**
   * Load prompt file (helper for report engine)
   */
  async loadPromptFile(filePath: string): Promise<string> {
    if (!existsSync(filePath)) {
      throw new Error(`Prompt file not found: ${filePath}`);
    }
    return readFileSync(filePath, "utf-8");
  }
}
