
'use client';

import { useEffect, useState } from 'react';
import DynamicForm from '@/components/dynamic-form';

export default function PipelineDetailPage({ params }: { params: { id: string } }) {
  const [pipeline, setPipeline] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    async function fetchPipeline() {
      try {
        const res = await fetch(`/api/pipelines/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch pipeline configuration.');
        }
        const data = await res.json();
        setPipeline(data);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    fetchPipeline();
  }, [params.id]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!pipeline) {
    return <div>Loading pipeline...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{pipeline.name}</h1>
      <p className="text-gray-400 mb-6">{pipeline.description}</p>
      <div className="max-w-2xl">
        <DynamicForm pipelineId={pipeline.id} schema={pipeline.inputSchema} />
      </div>
    </div>
  );
}
