
import Link from 'next/link';

// Define the type for the pipeline prop based on what the API returns
interface Pipeline {
  id: string;
  name: string;
  description: string;
  version: string;
}

interface PipelineCardProps {
  pipeline: Pipeline;
}

/**
 * A card component to display a summary of a pipeline.
 * It links to the detailed page for that pipeline.
 */
export default function PipelineCard({ pipeline }: PipelineCardProps) {
  return (
    <Link href={`/pipelines/${pipeline.id}`}>
      <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 h-full">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {pipeline.name}
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {pipeline.description}
        </p>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300 mt-4">
          v{pipeline.version}
        </span>
      </div>
    </Link>
  );
}
