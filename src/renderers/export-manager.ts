import { HtmlRenderer } from "./html-renderer.js";
import { PdfRenderer } from "./pdf-renderer.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import createDebug from "debug";

const debug = createDebug("framework:export");

export class ExportManager {
  private htmlRenderer: HtmlRenderer;
  private pdfRenderer: PdfRenderer;

  constructor() {
    this.htmlRenderer = new HtmlRenderer();
    this.pdfRenderer = new PdfRenderer();
  }

  async exportAll(
    markdown: string,
    formats: string[],
    outputDir: string
  ): Promise<Record<string, string>> {
    debug("Exporting to formats: %o", formats);

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
      debug("Created output directory: %s", outputDir);
    }

    const outputs: Record<string, string> = {};

    for (const format of formats) {
      const outputPath = join(outputDir, `report.${format}`);

      switch (format) {
        case "md":
          writeFileSync(outputPath, markdown);
          outputs.md = outputPath;
          debug("Exported: %s", outputPath);
          break;

        case "html":
          const html = await this.htmlRenderer.convert(markdown);
          writeFileSync(outputPath, html);
          outputs.html = outputPath;
          debug("Exported: %s", outputPath);
          break;

        case "pdf":
          const htmlForPdf = await this.htmlRenderer.convert(markdown);
          await this.pdfRenderer.convert(htmlForPdf, outputPath);
          outputs.pdf = outputPath;
          debug("Exported: %s", outputPath);
          break;

        case "mdx":
          const mdx = this.convertToMDX(markdown);
          writeFileSync(outputPath, mdx);
          outputs.mdx = outputPath;
          debug("Exported: %s", outputPath);
          break;

        default:
          debug("Unknown format: %s", format);
      }
    }

    return outputs;
  }

  private convertToMDX(markdown: string): string {
    if (markdown.startsWith("---\n")) {
      return markdown;
    }

    return `---
title: Report
date: ${new Date().toISOString().split("T")[0]}
---

${markdown}`;
  }
}
