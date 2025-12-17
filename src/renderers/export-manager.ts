import { PdfRenderer } from './pdf-renderer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import createDebug from 'debug';

const debug = createDebug('framework:export');

type SupportedFormat = 'html' | 'pdf' | 'docx';

/**
 * Manages the conversion of HTML content into different file formats like PDF or DOCX.
 */
export class ExportManager {
  private pdfRenderer: PdfRenderer;

  constructor() {
    this.pdfRenderer = new PdfRenderer();
  }

  /**
   * Converts a string of HTML content into a specified file format.
   *
   * @param htmlContent The HTML string to convert.
   * @param format The target format ('html', 'pdf', 'docx').
   * @param outputDir The directory to save the final file in.
   * @returns The full path to the generated artifact.
   */
  public async convert(
    htmlContent: string,
    format: SupportedFormat,
    outputDir: string
  ): Promise<string> {
    
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const filename = `report.${format}`;
    const outputPath = path.join(outputDir, filename);

    debug(`Converting to ${format} at ${outputPath}`);

    switch (format) {
      case 'html':
        writeFileSync(outputPath, htmlContent, 'utf-8');
        return outputPath;

      case 'pdf':
        await this.pdfRenderer.convert(htmlContent, outputPath);
        return outputPath;

      case 'docx':
        // Placeholder for DOCX conversion logic.
        // A library like 'html-to-docx' or an API call would be needed here.
        debug('DOCX conversion is not implemented yet.');
        throw new Error('DOCX export is not supported in this version.');

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}