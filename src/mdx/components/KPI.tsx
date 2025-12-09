import React from "react";

export interface KPIProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: string;
  color?: "blue" | "green" | "red" | "yellow";
}

function KPI({ title, value, trend, icon, color = "blue" }: KPIProps) {
  const trendDirection =
    trend && trend > 0 ? "up" : trend && trend < 0 ? "down" : null;

  return React.createElement(
    "div",
    { className: `kpi-card kpi-${color}` },
    icon && React.createElement("div", { className: "kpi-icon" }, icon),
    React.createElement(
      "div",
      { className: "kpi-content" },
      React.createElement("div", { className: "kpi-title" }, title),
      React.createElement("div", { className: "kpi-value" }, value),
      trend !== undefined &&
        React.createElement(
          "div",
          { className: `kpi-trend kpi-trend-${trendDirection}` },
          `${trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} ${Math.abs(trend)}%`
        )
    )
  );
}

export default KPI;
export { KPI };
