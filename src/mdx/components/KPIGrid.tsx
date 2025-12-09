import React from "react";

export interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

function KPIGrid({ children, columns = 3 }: KPIGridProps) {
  return React.createElement(
    "div",
    { className: `kpi-grid kpi-grid-${columns}` },
    children
  );
}

export default KPIGrid;
export { KPIGrid };
