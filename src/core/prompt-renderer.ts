import { readFileSync } from 'fs';
import nunjucks from 'nunjucks';
import createDebug from 'debug';
import { MDXRenderer } from '../mdx/mdx-renderer.js';

const debug = createDebug('framework:template-engine');

/**
 * Renders templates using Nunjucks for text-based formats
 * and MDX for rich component-based formats.
 */
export class PromptRenderer {
  private nunjucksEnv: nunjucks.Environment;
  private mdxRenderer: MDXRenderer;

  constructor() {
    this.nunjucksEnv = nunjucks.configure({ autoescape: true });
    this.mdxRenderer = new MDXRenderer();
    this.registerFilters();
  }

  /**
   * Renders a template file with the given data.
   * It automatically detects the template type (.njk, .mdx) and uses the appropriate renderer.
   *
   * @param templatePath The absolute path to the template file.
   * @param data The data context to pass to the template.
   * @returns A promise that resolves to the rendered string (HTML or other text).
   */
  public async render(templatePath: string, data: any): Promise<string> {
    debug(`Rendering template: ${templatePath}`);

    if (templatePath.endsWith('.mdx')) {
      // Delegate to MDX renderer
      const templateContent = readFileSync(templatePath, 'utf-8');
      const renderedHtml = await this.mdxRenderer.render(templateContent, data);
      debug(`MDX template rendered to ${renderedHtml.length} characters of HTML.`);
      return renderedHtml;
    }

    if (templatePath.endsWith('.njk')) {
      // Use Nunjucks for .njk files
      const templateContent = readFileSync(templatePath, 'utf-8');
      const renderedString = this.nunjucksEnv.renderString(templateContent, data);
      debug(`Nunjucks template rendered to ${renderedString.length} characters.`);
      return renderedString;
    }

    // Default to plain text rendering for unknown file types
    debug(`Unknown template type for ${templatePath}. Treating as plain text.`);
    return readFileSync(templatePath, 'utf-8');
  }

  private registerFilters(): void {
    // Example filter: format a number as a currency string
    this.nunjucksEnv.addFilter('currency', (num: number) => {
      if (typeof num !== 'number') return num;
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    });

    // Example filter: convert a string to uppercase
    this.nunjucksEnv.addFilter('uppercase', (str: string) => {
        if (typeof str !== 'string') return str;
        return str.toUpperCase();
    });
  }
}