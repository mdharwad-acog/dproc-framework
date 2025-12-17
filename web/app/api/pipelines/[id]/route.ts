
import { NextResponse } from 'next/server';
import { PipelineRegistry } from '@framework/core/pipeline/registry';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * API route to get a single pipeline's configuration by its ID.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const registry = new PipelineRegistry();
    await registry.scan();
    const pipeline = registry.get(id);

    if (!pipeline) {
      return NextResponse.json({ error: `Pipeline with ID "${id}" not found` }, { status: 404 });
    }

    // Convert Zod schema to a serializable JSON schema
    const jsonSchema = zodToJsonSchema(pipeline.inputSchema as any, "inputSchema");

    const serializablePipeline = {
      ...pipeline,
      inputSchema: jsonSchema,
    };

    return NextResponse.json(serializablePipeline);
  } catch (error) {
    console.error(`Failed to get pipeline ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to load pipeline' }, { status: 500 });
  }
}
