
import { z } from 'zod';

// This default export defines the pipeline's configuration.
// The framework discovers and registers this pipeline based on this file.
export default {
  id: 'sales-analysis',
  name: 'Sales Analysis Pipeline',
  description: 'Analyzes sales data from a CSV and generates insights using an LLM.',
  version: '1.0.0',
  
  // inputSchema defines the inputs required by the pipeline.
  // The framework uses this to auto-generate a UI form and for validation.
  inputSchema: z.object({
    csvUrl: z.string().url().describe('URL to the public sales CSV file'),
    format: z.enum(['pdf', 'html']).default('pdf').describe('Output report format'),
  }),

  // The formats this pipeline can output.
  outputFormats: ['pdf', 'html'],

  // The path to the main data processing logic for this pipeline.
  processor: './processor.ts',

  // The path to the template used for rendering the final report.
  template: './templates/report.njk',
};
