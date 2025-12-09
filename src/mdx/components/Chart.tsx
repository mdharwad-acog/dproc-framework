import React from "react";

export interface ChartProps {
  type: "bar" | "line" | "pie" | "scatter";
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  title?: string;
  width?: number;
  height?: number;
}

function Chart({
  type,
  data,
  xKey,
  yKey,
  title,
  width = 600,
  height = 400,
}: ChartProps) {
  // For now, keep placeholder
  // In v0.2.0, integrate Recharts:
  // import { BarChart, LineChart, PieChart, ScatterChart } from 'recharts';

  const chartData = data.map((item) => ({
    [xKey]: item[xKey],
    [yKey]: item[yKey],
  }));

  return React.createElement(
    "div",
    { className: "chart-container", style: { width, height } },
    title && React.createElement("h3", { className: "chart-title" }, title),
    React.createElement(
      "div",
      { className: "chart-placeholder" },
      React.createElement(
        "p",
        null,
        `${type.toUpperCase()} Chart: ${xKey} vs ${yKey}`
      ),
      React.createElement(
        "p",
        { className: "text-muted" },
        `${data.length} data points • Interactive charts in v0.2.0`
      ),
      // Show data preview
      React.createElement(
        "pre",
        { style: { fontSize: "0.8em", marginTop: "1rem", textAlign: "left" } },
        JSON.stringify(chartData.slice(0, 3), null, 2)
      )
    )
  );
}

export default Chart;
export { Chart };
