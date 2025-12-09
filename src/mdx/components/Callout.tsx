import React from "react";

export interface CalloutProps {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
}

function Callout({ type = "info", title, children }: CalloutProps) {
  const icons: Record<string, string> = {
    info: "ℹ️",
    warning: "⚠️",
    success: "✅",
    error: "❌",
  };

  return React.createElement(
    "div",
    { className: `callout callout-${type}` },
    React.createElement("div", { className: "callout-icon" }, icons[type]),
    React.createElement(
      "div",
      { className: "callout-content" },
      title &&
        React.createElement("div", { className: "callout-title" }, title),
      React.createElement("div", { className: "callout-body" }, children)
    )
  );
}

export default Callout;
export { Callout };
