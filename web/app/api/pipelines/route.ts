
import { NextResponse } from 'next/server';
import { PipelineRegistry } from '@framework/core/pipeline/registry';

/**
 * API route to get the list of all available pipelines.
 */
export async function GET() {
  try {
    // The registry needs to be instantiated and scanned on each request
    // to discover pipelines without restarting the server.
    const registry = new PipelineRegistry();
    await registry.scan();
    const pipelines = registry.list();
    return NextResponse.json(pipelines);
  } catch (error) {
    console.error('Failed to get pipelines:', error);
    return NextResponse.json({ error: 'Failed to load pipelines' }, { status: 500 });
  }
}
