import React from 'react';

interface ChartProps {
  type: string;
  data: any;
  title?: string;
}

export const Chart = ({ type, data, title }: ChartProps) => (
  <div className="chart-container">
    {title && <h3 className="chart-title">{title}</h3>}
    <div className="chart-placeholder">
      <p>Chart: {type}</p>
      <p className="text-muted">Data: {JSON.stringify(data).substring(0, 50)}...</p>
    </div>
  </div>
);
