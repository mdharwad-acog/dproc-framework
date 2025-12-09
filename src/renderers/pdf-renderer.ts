import { chromium, Browser, Page } from "playwright";
import createDebug from "debug";

const debug = createDebug("framework:pdf");

export interface PdfOptions {
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
}

export class PdfRenderer {
  /**
   * Convert HTML to PDF
   */
  async convert(
    html: string,
    outputPath: string,
    options?: PdfOptions
  ): Promise<void> {
    debug("Converting HTML to PDF: %s", outputPath);

    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle" });

      await page.pdf({
        path: outputPath,
        format: options?.format || "A4",
        landscape: options?.landscape || false,
        printBackground: options?.printBackground ?? true,
        margin: options?.margin || {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
        displayHeaderFooter: options?.displayHeaderFooter || false,
        headerTemplate: options?.headerTemplate || "",
        footerTemplate: options?.footerTemplate || "",
      });

      debug("PDF created successfully");
    } finally {
      await browser.close();
    }
  }

  /**
   * Convert HTML to PDF with custom page settings
   */
  async convertWithPageNumbers(
    html: string,
    outputPath: string,
    title?: string
  ): Promise<void> {
    await this.convert(html, outputPath, {
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px;">
          ${title || "Report"}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    });
  }
}
