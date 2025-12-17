
import { NextResponse } from 'next/server';
import { PipelineExecutor } from '@framework/core/pipeline/executor';

/**
 * API route to start a new pipeline execution.
 */
export async function POST(req: Request) {
  try {
    const { pipelineId, inputs } = await req.json();

    if (!pipelineId) {
      return NextResponse.json({ error: 'pipelineId is required' }, { status: 400 });
    }

    // The executor is instantiated here to ensure it has the latest context.
    const executor = new PipelineExecutor();
    const result = await executor.execute(pipelineId, inputs);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to start execution:', error);
    // This could be a Zod validation error or any other exception.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Failed to start execution', details: errorMessage }, { status: 500 });
  }
}
