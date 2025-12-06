import createDebug from "debug";

const debug = createDebug("framework:formula");

export class FormulaEngine {
  evaluate(formula: string, data: any[]): any {
    debug("Evaluating formula: %s", formula);

    // Parse formula: FUNCTION_NAME(column_name, ...)
    const match = formula.match(/^([A-Z_]+)\(([^)]+)\)$/);

    if (!match) {
      throw new Error(`Invalid formula syntax: ${formula}`);
    }

    const [, funcName, argsStr] = match;
    const args = argsStr.split(",").map((s) => s.trim());

    switch (funcName) {
      case "SUM":
        return this.sum(data, args[0]);
      case "AVG":
        return this.avg(data, args[0]);
      case "COUNT":
        return this.count(data);
      case "MIN":
        return this.min(data, args[0]);
      case "MAX":
        return this.max(data, args[0]);
      case "TOP":
        return this.top(data, args[0], args[1], parseInt(args[2] || "1"));
      case "PERCENT_CHANGE":
        return this.percentChange(data, args[0], args[1]);
      case "GROUP_BY":
        return this.groupBy(data, args[0], args[1]);
      default:
        throw new Error(`Unknown formula function: ${funcName}`);
    }
  }

  private sum(data: any[], column: string): number {
    return data.reduce((sum, row) => sum + (parseFloat(row[column]) || 0), 0);
  }

  private avg(data: any[], column: string): number {
    const sum = this.sum(data, column);
    return sum / data.length;
  }

  private count(data: any[]): number {
    return data.length;
  }

  private min(data: any[], column: string): number {
    const values = data
      .map((row) => parseFloat(row[column]))
      .filter((v) => !isNaN(v));
    return Math.min(...values);
  }

  private max(data: any[], column: string): number {
    const values = data
      .map((row) => parseFloat(row[column]))
      .filter((v) => !isNaN(v));
    return Math.max(...values);
  }

  private top(
    data: any[],
    groupColumn: string,
    valueColumn: string,
    n: number
  ): string {
    const grouped = this.groupBy(data, groupColumn, `SUM(${valueColumn})`);
    const sorted = Object.entries(grouped).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    );
    return sorted[0]?.[0] || "";
  }

  private percentChange(
    data: any[],
    valueColumn: string,
    periodColumn: string
  ): number {
    // Simple implementation: compare first half vs second half
    const sorted = [...data].sort(
      (a, b) =>
        new Date(a[periodColumn]).getTime() -
        new Date(b[periodColumn]).getTime()
    );

    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const sum1 = this.sum(firstHalf, valueColumn);
    const sum2 = this.sum(secondHalf, valueColumn);

    if (sum1 === 0) return 0;
    return ((sum2 - sum1) / sum1) * 100;
  }

  private groupBy(
    data: any[],
    groupColumn: string,
    aggregation: string
  ): Record<string, any> {
    const groups: Record<string, any[]> = {};

    // Group data
    data.forEach((row) => {
      const key = row[groupColumn];
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    // Parse aggregation: SUM(column)
    const match = aggregation.match(/^([A-Z_]+)\(([^)]+)\)$/);
    if (!match) {
      throw new Error(`Invalid aggregation: ${aggregation}`);
    }

    const [, funcName, column] = match;

    // Apply aggregation to each group
    const result: Record<string, any> = {};
    Object.entries(groups).forEach(([key, groupData]) => {
      switch (funcName) {
        case "SUM":
          result[key] = this.sum(groupData, column);
          break;
        case "AVG":
          result[key] = this.avg(groupData, column);
          break;
        case "COUNT":
          result[key] = groupData.length;
          break;
        default:
          throw new Error(`Unknown aggregation: ${funcName}`);
      }
    });

    return result;
  }
}
