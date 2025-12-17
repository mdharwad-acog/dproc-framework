async function getPipelines() {
  // This fetch call runs on the server.
  // The NEXT_PUBLIC_API_BASE_URL should be set to http://localhost:3000 in development.
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${apiBaseUrl}/api/pipelines`, { cache: 'no-store' });

  if (!res.ok) {
    // This will be caught by the Error Boundary
    throw new Error('Failed to fetch pipelines');
  }

  return res.json();
}

/**
 * The home page, which displays a gallery of available pipelines.
 */
import PipelineCard from '@/components/pipeline-card';

export default async function HomePage() {
  try {
    const pipelines = await getPipelines();

    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Pipeline Gallery</h1>
        {pipelines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelines.map((pipeline: any) => (
              <PipelineCard key={pipeline.id} pipeline={pipeline} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No pipelines found. Check the `shared/dproc-workspace` directory.</p>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="text-red-500">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p>{(error as Error).message}</p>
        <p className="mt-4 text-gray-400">
          Could not connect to the API. Ensure the server is running and the
          <code>NEXT_PUBLIC_API_BASE_URL</code> environment variable is set correctly.
        </p>
      </div>
    );
  }
}