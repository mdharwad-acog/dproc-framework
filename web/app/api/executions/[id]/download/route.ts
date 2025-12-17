
import { NextResponse } from 'next/server';
import { PipelineExecutor } from '@framework/core/pipeline/executor';
import * as fs from 'fs';
import * as path from 'path';
import { stat } from 'fs/promises';

/**
 * API route to download the artifact of a completed execution.
 */
export async function GET(req: Request, { params }: { params: { id:string } }) {
  try {
    const { id } = params;
    const execution = PipelineExecutor.getStatus(id);

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }
    if (execution.status !== 'completed' || !execution.artifactPath) {
      return NextResponse.json({ error: 'Artifact not available' }, { status: 400 });
    }

    const filePath = execution.artifactPath;
    
    // Check if file exists before attempting to read
    try {
      await stat(filePath);
    } catch (error: any) { // Cast error to any
       if (error.code === 'ENOENT') {
         console.error(`Artifact file not found at path: ${filePath}`);
         return NextResponse.json({ error: 'Artifact file not found.' }, { status: 404 });
       }
       throw error;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    // Determine content type based on file extension
    const extension = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    if (extension === '.pdf') {
      contentType = 'application/pdf';
    } else if (extension === '.html') {
      contentType = 'text/html';
    } else if (extension === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return new Response(fileBuffer, { headers });

  } catch (error) {
    console.error(`Failed to download artifact for execution ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to download artifact' }, { status: 500 });
  }
}
