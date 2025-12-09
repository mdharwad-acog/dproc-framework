import React from 'react';

interface KPIGridProps {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export const KPIGrid = ({ columns = 3, children }: KPIGridProps) => (
  <div className={`kpi-grid kpi-grid-${columns}`}>
    {children}
  </div>
);
