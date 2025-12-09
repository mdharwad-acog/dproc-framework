import { marked } from "marked";
import createDebug from "debug";

const debug = createDebug("framework:html");

export interface HtmlRenderOptions {
  theme?: "github" | "minimal" | "professional";
  includeCSS?: boolean;
  customCSS?: string;
  syntaxHighlight?: boolean;
}

export class HtmlRenderer {
  /**
   * Convert markdown to HTML
   */
  async convert(
    markdown: string,
    options?: HtmlRenderOptions
  ): Promise<string> {
    debug("Converting markdown to HTML");

    // Configure marked
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });

    const html = await marked.parse(markdown);

    if (options?.includeCSS !== false) {
      return this.wrapWithCSS(html, options);
    }

    return html;
  }

  /**
   * Wrap HTML content with CSS styling
   */
  private wrapWithCSS(body: string, options?: HtmlRenderOptions): string {
    const theme = options?.theme || "github";
    const customCSS = options?.customCSS || "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report</title>
  <style>
    ${this.getThemeCSS(theme)}
    ${customCSS}
  </style>
</head>
<body>
  <div class="markdown-body">
    ${body}
  </div>
</body>
</html>`;
  }

  /**
   * Get CSS for selected theme
   */
  private getThemeCSS(theme: string): string {
    const baseCSS = `
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 2rem;
        background: #fff;
      }
      
      .markdown-body {
        max-width: 980px;
        margin: 0 auto;
      }
    `;

    switch (theme) {
      case "github":
        return baseCSS + this.getGitHubCSS();
      case "minimal":
        return baseCSS + this.getMinimalCSS();
      case "professional":
        return baseCSS + this.getProfessionalCSS();
      default:
        return baseCSS + this.getGitHubCSS();
    }
  }

  /**
   * GitHub-style CSS
   */
  private getGitHubCSS(): string {
    return `
      .markdown-body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #24292e;
      }
      
      .markdown-body h1 {
        font-size: 2em;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
      }
      
      .markdown-body h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
      }
      
      .markdown-body h3 {
        font-size: 1.25em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
      }
      
      .markdown-body p {
        margin-top: 0;
        margin-bottom: 16px;
      }
      
      .markdown-body code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: rgba(27, 31, 35, 0.05);
        border-radius: 3px;
        font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
      }
      
      .markdown-body pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 3px;
      }
      
      .markdown-body pre code {
        background: transparent;
        padding: 0;
      }
      
      .markdown-body table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 16px;
      }
      
      .markdown-body table th,
      .markdown-body table td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
      }
      
      .markdown-body table th {
        font-weight: 600;
        background-color: #f6f8fa;
      }
      
      .markdown-body table tr:nth-child(2n) {
        background-color: #f6f8fa;
      }
      
      .markdown-body blockquote {
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
        margin: 0 0 16px 0;
      }
      
      .markdown-body ul, .markdown-body ol {
        padding-left: 2em;
        margin-top: 0;
        margin-bottom: 16px;
      }
      
      .markdown-body li {
        margin-top: 0.25em;
      }
    `;
  }

  /**
   * Minimal CSS
   */
  private getMinimalCSS(): string {
    return `
      .markdown-body {
        font-family: Georgia, serif;
        font-size: 18px;
        line-height: 1.8;
        color: #333;
      }
      
      .markdown-body h1, .markdown-body h2, .markdown-body h3 {
        font-weight: normal;
        margin-top: 2em;
        margin-bottom: 0.5em;
      }
      
      .markdown-body h1 { font-size: 2em; }
      .markdown-body h2 { font-size: 1.5em; }
      .markdown-body h3 { font-size: 1.2em; }
      
      .markdown-body p {
        margin-bottom: 1em;
      }
      
      .markdown-body code {
        font-family: 'Courier New', monospace;
        background: #f5f5f5;
        padding: 2px 4px;
      }
    `;
  }

  /**
   * Professional CSS
   */
  private getProfessionalCSS(): string {
    return `
      .markdown-body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
      }
      
      .markdown-body h1 {
        font-size: 18pt;
        font-weight: bold;
        text-align: center;
        margin-top: 0;
        margin-bottom: 1em;
      }
      
      .markdown-body h2 {
        font-size: 14pt;
        font-weight: bold;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      
      .markdown-body h3 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 1em;
        margin-bottom: 0.5em;
      }
      
      .markdown-body p {
        text-align: justify;
        margin-bottom: 1em;
      }
      
      .markdown-body table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }
      
      .markdown-body th, .markdown-body td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }
      
      .markdown-body th {
        background-color: #f0f0f0;
        font-weight: bold;
      }
      
      @media print {
        .markdown-body {
          font-size: 11pt;
        }
      }
    `;
  }
}
