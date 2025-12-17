'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { z } from 'zod';

interface DynamicFormProps {
  pipelineId: string;
  schema: any; // JSON Schema from zod-to-json-schema
}

/**
 * A form that is dynamically generated from a JSON schema.
 * It handles input rendering and submission.
 */
export default function DynamicForm({ pipelineId, schema }: DynamicFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Initialize form with default values from the schema
    const defaults: Record<string, any> = {};
    if (schema.properties) {
        Object.keys(schema.properties).forEach(key => {
            if (schema.properties[key].default) {
                defaults[key] = schema.properties[key].default;
            }
        });
    }
    return defaults;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | boolean | number = value;

    if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
        finalValue = parseFloat(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Basic validation can be done here if needed, but the server will do the full Zod validation.
      const response = await fetch('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineId, inputs: formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to start execution.');
      }

      const result = await response.json();
      router.push(`/executions/${result.executionId}`);

    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(`Validation failed: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      } else {
        setError((err as Error).message);
      }
      setIsLoading(false);
    }
  };

  const renderField = (key: string, fieldSchema: any) => {
    const label = fieldSchema.description || key;
    const type = fieldSchema.type;

    if (fieldSchema.enum) {
      return (
        <div key={key} className="mb-4">
          <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          <select
            id={key}
            name={key}
            value={formData[key] || fieldSchema.default || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {fieldSchema.enum.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'boolean') {
      return (
        <div key={key} className="mb-4 flex items-center">
          <input
            id={key}
            name={key}
            type="checkbox"
            checked={formData[key] || fieldSchema.default || false}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor={key} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{label}</label>
        </div>
      );
    }

    const inputType = type === 'number' || type === 'integer' ? 'number' : 'text';
    const finalUrlType = fieldSchema.format === 'uri' ? 'url' : inputType;

    return (
      <div key={key} className="mb-4">
        <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
          type={finalUrlType}
          id={key}
          name={key}
          value={formData[key] || fieldSchema.default || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.properties && Object.keys(schema.properties).map(key => renderField(key, schema.properties[key]))}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        {isLoading ? 'Executing...' : 'Run Pipeline'}
      </button>
    </form>
  );
}