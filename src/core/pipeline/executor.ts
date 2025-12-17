
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { LlmClient } from '../llm-client'; // To be refactored
import { PromptRenderer } from '../prompt-renderer'; // To be refactored, acting as TemplateEngine
import { ExportManager } from '../../renderers/export-manager'; // To be refactored, acting as OutputConverter
import { PipelineRegistry } from './registry';
import { ExecutionResult, PipelineContext } from './types';

// A simple in-memory store for execution status.
// In a real application, this would be a database or a persistent cache.
const executionStore: Map<string, ExecutionResult> = new Map();

/**
 * Handles the execution of a single pipeline.
 */
export class PipelineExecutor {
  private registry: PipelineRegistry;
  private llmClient: LlmClient;
  private templateRenderer: PromptRenderer;
  private outputConverter: ExportManager;

  constructor() {
    this.registry = new PipelineRegistry();
    this.llmClient = new LlmClient(); // Placeholder for refactored client
    this.templateRenderer = new PromptRenderer(); // Placeholder for refactored renderer
    this.outputConverter = new ExportManager(); // Placeholder for refactored converter
  }

  /**
   * Executes a pipeline by its ID with the given inputs.
   * @param pipelineId The ID of the pipeline to execute.
   * @param inputs The input data for the pipeline.
   * @returns A promise that resolves to the execution result.
   */
  public async execute(pipelineId: string, inputs: unknown): Promise<ExecutionResult> {
    const executionId = uuidv4();
    let tempWorkspace = '';

    try {
      // 1. Get pipeline from registry
      await this.registry.scan();
      const pipeline = this.registry.get(pipelineId);
      if (!pipeline) {
        throw new Error(`Pipeline with ID "${pipelineId}" not found.`);
      }

      // Initialize and store execution status
      const initialResult: ExecutionResult = { executionId, status: 'running' };
      executionStore.set(executionId, initialResult);

      // 2. Validate inputs using the pipeline's Zod schema
      const validatedInputs = pipeline.inputSchema.parse(inputs);
      const outputFormat = (validatedInputs.format || pipeline.outputFormats[0]) as ('html' | 'pdf' | 'docx');

      // 3. Create a temporary workspace directory for this execution
      tempWorkspace = await fs.mkdtemp(path.join(os.tmpdir(), `dproc-${executionId}-`));


      // 4. Dynamically import the pipeline's processor module
      const processorModule = await import(pipeline.processor);
      if (typeof processorModule.default !== 'function') {
        throw new Error(`Processor at ${pipeline.processor} does not have a default export or it's not a function.`);
      }

      // 5. Call the processor with inputs and context
      const context: PipelineContext = {
        workspace: tempWorkspace,
        llm: {
          generate: this.llmClient.generateText.bind(this.llmClient),
        },
        logger: console,
      };
      const data = await processorModule.default(validatedInputs, context);

      // 6. Render the output using the pipeline's template
      const htmlContent = await this.templateRenderer.render(pipeline.template, data);
      
      // 7. Convert the rendered HTML to the requested output format
      const artifactPath = await this.outputConverter.convert(
        htmlContent,
        outputFormat,
        tempWorkspace
      );

      // 8. Save artifact and return final result
      const finalResult: ExecutionResult = {
        ...initialResult,
        status: 'completed',
        artifactPath,
      };
      executionStore.set(executionId, finalResult);
      return finalResult;

    } catch (error) {
      console.error(`[Execution ${executionId}] Failed:`, error);
      const errorResult: ExecutionResult = {
        executionId,
        status: 'failed',
        error: (error as Error).message,
      };
      executionStore.set(executionId, errorResult);
      // Clean up temp directory on failure
      if (tempWorkspace) {
        await fs.rm(tempWorkspace, { recursive: true, force: true });
      }
      return errorResult;
    }
  }

  /**
   * Retrieves the status of an execution.
   * @param executionId The ID of the execution.
   * @returns The execution result, or undefined if not found.
   */
  public static getStatus(executionId: string): ExecutionResult | undefined {
    return executionStore.get(executionId);
  }
}
