import React from "react";

export interface MetricProps {
  label: string;
  value: string | number;
  change?: number;
  format?: "number" | "currency" | "percent";
}

function Metric({ label, value, change, format = "number" }: MetricProps) {
  const formattedValue =
    format === "currency"
      ? `$${value}`
      : format === "percent"
      ? `${value}%`
      : value;

  return React.createElement(
    "div",
    { className: "metric" },
    React.createElement("div", { className: "metric-label" }, label),
    React.createElement("div", { className: "metric-value" }, formattedValue),
    change !== undefined &&
      React.createElement(
        "div",
        {
          className: `metric-change ${change >= 0 ? "positive" : "negative"}`,
        },
        `${change >= 0 ? "+" : ""}${change}%`
      )
  );
}

export default Metric;
export { Metric };
