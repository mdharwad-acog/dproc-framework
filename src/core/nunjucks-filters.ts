import nunjucks from "nunjucks";

export function registerFilters(env: nunjucks.Environment): void {
  // Number formatting
  env.addFilter("format_number", (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  });

  // Round numbers
  env.addFilter("round", (num: number, decimals: number = 0) => {
    return Number(num.toFixed(decimals));
  });

  // Format dates
  env.addFilter("date", (dateStr: string, format: string = "short") => {
    const date = new Date(dateStr);
    if (format === "short") {
      return date.toLocaleDateString("en-US");
    } else if (format === "long") {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return dateStr;
  });

  // Truncate text
  env.addFilter("truncate", (text: string, length: number = 50) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  });

  // Capitalize
  env.addFilter("capitalize", (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  });

  // Percentage
  env.addFilter("percent", (num: number, decimals: number = 1) => {
    return (num * 100).toFixed(decimals) + "%";
  });
}
