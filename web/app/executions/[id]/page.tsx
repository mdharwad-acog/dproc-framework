
'use client';

import { useParams } from 'next/navigation';
import ExecutionStatus from '@/components/execution-status';

export default function ExecutionPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Execution Details</h1>
            {id ? (
                <ExecutionStatus executionId={id} />
            ) : (
                <p>Loading execution details...</p>
            )}
        </div>
    );
}
