import React from 'react';

interface KPIProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export const KPI = ({ label, value, trend, color = 'blue' }: KPIProps) => (
  <div className={`kpi-card kpi-${color}`}>
    <div className="kpi-content">
      <div className="kpi-title">{label}</div>
      <div className="kpi-value">{value}</div>
      {trend && <div className={`kpi-trend kpi-trend-${trend}`}>→ {trend}</div>}
    </div>
  </div>
);
