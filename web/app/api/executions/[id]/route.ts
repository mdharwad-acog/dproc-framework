
import { NextResponse } from 'next/server';
import { PipelineExecutor } from '@framework/core/pipeline/executor';

/**
 * API route to get the status of a specific pipeline execution.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const status = PipelineExecutor.getStatus(id);

    if (!status) {
      return NextResponse.json({ error: `Execution with ID "${id}" not found` }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error(`Failed to get execution status for ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to get execution status' }, { status: 500 });
  }
}
