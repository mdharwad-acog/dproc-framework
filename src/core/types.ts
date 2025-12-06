import { z } from "zod";

// ==================== BUNDLE TYPES ====================

export const BundleMetadataSchema = z.object({
  ingested_at: z.string(),
  source_file: z.string(),
  record_count: z.number(),
});

export const BundleSchema = z.object({
  source: z.string(),
  records: z.array(z.record(z.string(), z.any())),
  stats: z.record(z.string(), z.any()),
  metadata: BundleMetadataSchema,
  samples: z.object({
    main: z.array(z.record(z.string(), z.any())),
  }),
});

export type Bundle = z.infer<typeof BundleSchema>;
export type BundleMetadata = z.infer<typeof BundleMetadataSchema>;

// ==================== ENRICHED BUNDLE ====================

export interface EnrichedBundle extends Bundle {
  customFields: Record<string, any>;
  computedFields: Record<string, any>;
}

// ==================== CONFIGURATION TYPES ====================

export const CustomFieldSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const ComputedFieldSchema = z.object({
  name: z.string(),
  function: z.string(),
});

export type CustomField = z.infer<typeof CustomFieldSchema>;
export type ComputedField = z.infer<typeof ComputedFieldSchema>;

// ==================== REPORT SPEC (SEPARATE FILE) ====================

export const ReportVariableSchema = z.object({
  name: z.string(),
  type: z.enum(["markdown", "string", "string_list", "json", "number"]),
  promptFile: z.string(),
  inputs: z.array(z.string()),
});

export const ReportSpecSchema = z.object({
  id: z.string().optional(),
  templateFile: z.string(),
  variables: z.array(ReportVariableSchema),
});

export type ReportVariable = z.infer<typeof ReportVariableSchema>;
export type ReportSpec = z.infer<typeof ReportSpecSchema>;

// ==================== PROJECT CONFIG (NO EMBEDDED SPEC) ====================

export const ProjectConfigSchema = z.object({
  reportName: z.string(),
  author: z.string().optional(),
  version: z.string().optional(),
  dataSources: z.array(z.string()),
  fields: z
    .object({
      custom: z.array(CustomFieldSchema).optional(),
      computed: z.array(ComputedFieldSchema).optional(),
    })
    .optional(),
  specFile: z.string(), // REQUIRED - must point to spec.yml
  output: z.object({
    formats: z.array(z.enum(["md", "html", "pdf", "mdx"])),
    destination: z.string().default("./output"),
  }),
  llm: z
    .object({
      provider: z.enum(["gemini", "openai", "deepseek"]).optional(),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
    })
    .optional(),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

// ==================== LLM TYPES ====================

export type Provider = "gemini" | "openai" | "deepseek";

export interface LLMConfig {
  provider: Provider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMClient {
  generateText(params: { prompt: string; model?: string }): Promise<string>;
}

// ==================== FRAMEWORK DEFAULTS ====================

export const FrameworkDefaultsSchema = z.object({
  llm: z.object({
    provider: z.enum(["gemini", "openai", "deepseek"]),
    model: z.string(),
    temperature: z.number(),
    maxTokens: z.number(),
  }),
  paths: z.object({
    prompts: z.string(),
    templates: z.string(),
    data: z.string(),
    output: z.string(),
  }),
});

export type FrameworkDefaults = z.infer<typeof FrameworkDefaultsSchema>;
