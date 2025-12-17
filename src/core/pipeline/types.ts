
import { z } from 'zod';

/**
 * Defines the structure for a pipeline's configuration.
 * This is loaded from pipeline.config.ts in a pipeline's directory.
 */
export interface PipelineConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  // Zod schema for input validation and form generation in the UI.
  inputSchema: z.ZodObject<any>;
  // Supported output formats for the report.
  outputFormats: ('html' | 'pdf' | 'docx')[];
  // Path to the main data processing script for the pipeline.
  processor: string;
  // Path to the template file for rendering the output.
  template: string;
}

/**
 * The context object passed to a pipeline's processor function.
 * It provides access to framework-level resources.
 */
export interface PipelineContext {
  // A temporary directory for the pipeline execution.
  workspace: string;
  // The configured LLM client for generative AI tasks.
  llm: {
    generate: (prompt: string) => Promise<string>;
  };
  // A logger for outputting information during execution.
  logger: Console;
}

/**
 * Represents the result of a pipeline execution.
 */
export interface ExecutionResult {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  // Path to the generated artifact (e.g., PDF report).
  artifactPath?: string;
  error?: string;
}
