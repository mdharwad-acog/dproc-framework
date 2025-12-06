// Core exports for programmatic usage
export { BundleLoader } from "./bundle-loader.js";
export { FormulaEngine } from "./formula-engine.js";
export { ReportEngine } from "./report-engine.js";
export { AiSdkLlmClient } from "./llm-client.js";
export { SecretsManager } from "./secrets-manager.js";
export { ConfigManager } from "./config-manager.js";
export { ProjectConfigLoader } from "./project-config.js";
export { PromptRenderer } from "./prompt-renderer.js";
export { DataValidator } from "./validators.js";

// Type exports
export type {
  Provider,
  Bundle,
  EnrichedBundle,
  ProjectConfig,
  CustomField,
  ComputedField,
  ReportVariable,
  LLMClient,
  LLMConfig,
} from "./types.js";

// Connector exports
export { UniversalConnector } from "../connectors/universal-connector.js";
export { CSVConnector } from "../connectors/csv-connector.js";
export { JSONConnector } from "../connectors/json-connector.js";

// Renderer exports
export { HtmlRenderer } from "../renderers/html-renderer.js";
export { PdfRenderer } from "../renderers/pdf-renderer.js";
export { ExportManager } from "../renderers/export-manager.js";
