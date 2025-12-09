import createDebug from "debug";

const debug = createDebug("framework:component-registry");

export class ComponentRegistry {
  private components: Map<string, any>;

  constructor() {
    this.components = new Map();
    this.registerBuiltinComponents();
  }

  register(name: string, component: any): void {
    debug("Registering component: %s", name);
    this.components.set(name, component);
  }

  get(name: string): any {
    return this.components.get(name);
  }

  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    this.components.forEach((component, name) => {
      result[name] = component;
    });
    return result;
  }

  listComponents(): string[] {
    return Array.from(this.components.keys());
  }

  has(name: string): boolean {
    return this.components.has(name);
  }

  private async registerBuiltinComponents(): Promise<void> {
    debug("Registering builtin components");

    try {
      // Use default imports
      const DataTableModule = await import("./components/DataTable.js");
      const ChartModule = await import("./components/Chart.js");
      const KPIModule = await import("./components/KPI.js");
      const KPIGridModule = await import("./components/KPIGrid.js");
      const CalloutModule = await import("./components/Callout.js");

      // Get default export
      this.register("DataTable", DataTableModule.default);
      this.register("Chart", ChartModule.default);
      this.register("KPI", KPIModule.default);
      this.register("KPIGrid", KPIGridModule.default);
      this.register("Callout", CalloutModule.default);

      debug("Registered %d builtin components", this.components.size);
    } catch (error: any) {
      console.error("Failed to register builtin components:", error.message);
      debug("Registration error: %O", error);
    }
  }

  async ensureLoaded(): Promise<void> {
    if (this.components.size === 0) {
      await this.registerBuiltinComponents();
    }
  }
}
