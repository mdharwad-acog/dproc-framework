import { HtmlRenderer } from "./html-renderer.js";
import { PdfRenderer } from "./pdf-renderer.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import createDebug from "debug";

const debug = createDebug("framework:export");

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type ExportFormat = "md" | "html" | "pdf" | "mdx" | "json";

export interface ExportOptions {
  formats: ExportFormat[];
  outputDir: string;
  filename?: string;
  metadata?: Record<string, any>;
  onProgress?: (format: string, status: "start" | "complete" | "error") => void;
}

export class ExportManager {
  private htmlRenderer: HtmlRenderer;
  private pdfRenderer: PdfRenderer;

  constructor() {
    this.htmlRenderer = new HtmlRenderer();
    this.pdfRenderer = new PdfRenderer();
  }

  /**
   * Export content to multiple formats
   */
  async exportAll(
    markdown: string,
    formats: ExportFormat[],
    outputDir: string,
    options?: { filename?: string; metadata?: Record<string, any> }
  ): Promise<Record<string, string>> {
    debug("Exporting to formats: %o", formats);

    // Validate formats
    const validFormats = this.validateFormats(formats);
    if (validFormats.length === 0) {
      throw new Error("No valid export formats specified");
    }

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
      debug("Created output directory: %s", outputDir);
    }

    const outputs: Record<string, string> = {};
    const filename = options?.filename || "report";

    // Check if content is MDX-rendered
    const isMDXRendered = markdown.startsWith("<!-- MDX_RENDERED -->");
    let cleanContent = markdown;

    if (isMDXRendered) {
      // Remove marker
      cleanContent = markdown.replace("<!-- MDX_RENDERED -->\n", "");
      debug("Detected MDX-rendered content");
    }

    for (const format of validFormats) {
      const outputPath = join(outputDir, `${filename}.${format}`);

      try {
        debug("Exporting format: %s", format);

        switch (format) {
          case "md":
            await this.exportToMarkdown(
              cleanContent,
              outputPath,
              isMDXRendered
            );
            outputs.md = outputPath;
            break;

          case "html":
            await this.exportToHTML(cleanContent, outputPath, isMDXRendered);
            outputs.html = outputPath;
            break;

          case "pdf":
            await this.exportToPDF(cleanContent, outputPath, isMDXRendered);
            outputs.pdf = outputPath;
            break;

          case "mdx":
            await this.exportToMDX(
              cleanContent,
              outputPath,
              isMDXRendered,
              options?.metadata
            );
            outputs.mdx = outputPath;
            break;

          case "json":
            await this.exportToJSON(
              cleanContent,
              outputPath,
              options?.metadata
            );
            outputs.json = outputPath;
            break;

          default:
            debug("Unknown format: %s", format);
        }

        debug("Exported: %s", outputPath);
      } catch (error: any) {
        console.error(`❌ Failed to export ${format}: ${error.message}`);
        debug("Export error details: %O", error);
      }
    }

    return outputs;
  }

  /**
   * Validate export formats
   */
  private validateFormats(formats: string[]): ExportFormat[] {
    const valid: ExportFormat[] = [];
    const validSet = new Set<ExportFormat>([
      "md",
      "html",
      "pdf",
      "mdx",
      "json",
    ]);

    for (const format of formats) {
      if (validSet.has(format as ExportFormat)) {
        valid.push(format as ExportFormat);
      } else {
        console.warn(`⚠️ Invalid export format: ${format}`);
      }
    }

    return valid;
  }

  /**
   * Export to Markdown
   */
  private async exportToMarkdown(
    content: string,
    outputPath: string,
    isMDXRendered: boolean
  ): Promise<void> {
    if (isMDXRendered) {
      // For MDX content, save the HTML with a note
      const mdContent = `<!-- This content was rendered from MDX components -->\n\n${content}`;
      writeFileSync(outputPath, mdContent);
    } else {
      writeFileSync(outputPath, content);
    }
  }

  /**
   * Export to HTML with optional MDX component styles
   */
  private async exportToHTML(
    content: string,
    outputPath: string,
    isMDXRendered: boolean
  ): Promise<void> {
    let bodyContent: string;
    let additionalStyles = "";

    if (isMDXRendered) {
      // Content is already HTML from MDX
      bodyContent = content;

      // Load MDX component styles
      try {
        const stylesPath = join(__dirname, "../mdx/styles/components.css");
        if (existsSync(stylesPath)) {
          additionalStyles = readFileSync(stylesPath, "utf-8");
          debug("Loaded MDX component styles");
        }
      } catch (error: any) {
        debug("Could not load MDX styles: %s", error.message);
      }
    } else {
      // Convert markdown to HTML
      bodyContent = await this.htmlRenderer.convert(content);
    }

    // Create full HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
      background: #fff;
    }
    ${additionalStyles}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

    writeFileSync(outputPath, html, "utf-8");
  }

  /**
   * Export to PDF
   */
  private async exportToPDF(
    content: string,
    outputPath: string,
    isMDXRendered: boolean
  ): Promise<void> {
    const htmlForPdf = isMDXRendered
      ? await this.wrapMDXHTML(content)
      : await this.htmlRenderer.convert(content);

    await this.pdfRenderer.convert(htmlForPdf, outputPath);
  }

  /**
   * Export to MDX format
   */
  private async exportToMDX(
    content: string,
    outputPath: string,
    isMDXRendered: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    const mdx = this.convertToMDX(isMDXRendered ? content : content, metadata);
    writeFileSync(outputPath, mdx);
  }

  /**
   * Export to JSON format
   */
  private async exportToJSON(
    content: string,
    outputPath: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const jsonData = {
      content,
      metadata: metadata || {},
      generatedAt: new Date().toISOString(),
      version: "1.0.0",
    };

    writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), "utf-8");
  }

  /**
   * Wrap MDX HTML content in a full HTML document
   */
  private async wrapMDXHTML(htmlContent: string): Promise<string> {
    let componentStyles = "";

    try {
      const stylesPath = join(__dirname, "../mdx/styles/components.css");
      if (existsSync(stylesPath)) {
        componentStyles = readFileSync(stylesPath, "utf-8");
      }
    } catch (error) {
      debug("Could not load component styles: %s", error);
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }
    ${componentStyles}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  }

  /**
   * Convert to MDX format with frontmatter
   */
  private convertToMDX(
    content: string,
    metadata?: Record<string, any>
  ): string {
    // If already has frontmatter, return as is
    if (content.startsWith("---\n")) {
      return content;
    }

    // Build frontmatter
    const frontmatter: Record<string, any> = {
      title: "Report",
      date: new Date().toISOString().split("T")[0],
      author: "Data Processing Framework",
      ...metadata,
    };

    const frontmatterStr = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join("\n");

    return `---\n${frontmatterStr}\n---\n\n${content}`;
  }
}
