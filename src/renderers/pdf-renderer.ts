import { chromium } from "playwright";
import createDebug from "debug";

const debug = createDebug("framework:pdf");

export class PdfRenderer {
  async convert(html: string, outputPath: string): Promise<void> {
    debug("Converting HTML to PDF: %s", outputPath);

    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle" });

      await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
      });

      debug("PDF created successfully");
    } finally {
      await browser.close();
    }
  }
}
