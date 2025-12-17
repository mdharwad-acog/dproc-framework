
'use client';

import { useEffect, useState } from 'react';

interface ExecutionStatusProps {
  executionId: string;
}

interface ExecutionResult {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  artifactPath?: string;
  error?: string;
}

/**
 * A component that polls and displays the status of a pipeline execution.
 * It shows the current status and provides a download link when completed.
 */
export default function ExecutionStatus({ executionId }: ExecutionStatusProps) {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!executionId) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/executions/${executionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch execution status.');
        }
        const data: ExecutionResult = await response.json();
        setResult(data);

        // Stop polling if the execution is finished (completed or failed)
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError((err as Error).message);
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(pollStatus, 2000); // Poll every 2 seconds
    pollStatus(); // Initial fetch

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [executionId]);

  const renderStatus = () => {
    if (error) {
      return <p className="text-red-500">Error: {error}</p>;
    }
    if (!result) {
      return (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading status...</p>
        </div>
      );
    }

    switch (result.status) {
      case 'pending':
      case 'running':
        return (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="capitalize">{result.status}...</p>
          </div>
        );
      case 'completed':
        return (
          <div>
            <p className="text-green-400">Status: Completed</p>
            <a
              href={`/api/executions/${executionId}/download`}
              className="mt-4 inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Download Artifact
            </a>
          </div>
        );
      case 'failed':
        return (
          <div>
            <p className="text-red-500">Status: Failed</p>
            {result.error && <p className="text-red-400 mt-2">Reason: {result.error}</p>}
          </div>
        );
      default:
        return <p>Unknown status</p>;
    }
  };

  return (
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow">
          <h5 className="mb-4 text-2xl font-bold tracking-tight text-white">Execution Status</h5>
          {renderStatus()}
      </div>
  );
}
