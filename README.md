# dproc-framework

**Production-ready LLM-powered data processing and report generation framework**

Transform any dataset (CSV, JSON) into AI-powered, structured reports with multi-format export (Markdown, HTML, PDF) and interactive MDX components.

[![npm version](https://img.shields.io/npm/v/@aganitha/dproc-framework.svg)](https://npm.aganitha.ai/-/web/detail/@aganitha/dproc-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [CLI Reference](#-cli-reference)
- [Web UI](#-web-ui)
- [Configuration](#-configuration)
- [Advanced Usage](#-advanced-usage)
- [API Documentation](#-api-documentation)
- [Examples](#-examples)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Capabilities

- **Multi-LLM Support**: Gemini, OpenAI, DeepSeek with automatic fallback
- **Universal Data Connectors**: CSV, JSON with auto-normalization
- **AI-Powered Analysis**: Natural language prompts with structured parsing
- **Multi-Format Export**: Markdown, HTML, PDF, MDX
- **Interactive Components**: KPIs, charts, tables, callouts via MDX
- **Web UI**: Browser-based project management and report viewer

### Advanced Features

- **Enhanced Data Processing** (Phase 1)
  - Auto schema inference with Zod
  - Field normalization (dates, numbers, text)
  - Comprehensive statistics calculation
- **Advanced Prompting** (Phase 2)
  - Built-in prompt library (common + domain-specific)
  - Context window management for large datasets
  - Structured output parsing (JSON, tables, lists)
  - Variable validation before rendering
- **MDX Components** (Phase 3)
  - Server-side rendering
  - Interactive data tables with sorting/filtering
  - KPI grids and callouts
  - Chart placeholders

---

## 📦 Installation

### From Aganitha Registry

```bash
npm install -g @aganitha/dproc-framework
```

### Verify Installation

```bash
dproc --version
# Output: 0.1.0
```

### Prerequisites

- **Node.js**: ≥18.0.0
- **pnpm**: ≥8.0.0 (recommended)
- **API Keys**: At least one of Gemini, OpenAI, or DeepSeek

---

## 🚀 Quick Start

### 1. Configure API Keys

```bash
dproc setup
```

Follow prompts to enter:

- Gemini API key (get from https://makersuite.google.com/app/apikey)
- OpenAI API key (get from https://platform.openai.com/api-keys)
- DeepSeek API key (get from https://platform.deepseek.com)

Keys are stored securely in `~/.aganitha/.llm-framework/secrets.json`

### 2. Create a Project

```bash
dproc init sales-report --template sales
cd sales-report
```

Generated structure:

```
sales-report/
├── dproc.config.json    # Project configuration
├── spec.yml             # Report structure definition
├── data/
│   └── sample-sales.csv # Sample dataset
├── prompts/
│   └── executive-summary.md
├── templates/
│   └── sales-report.njk
└── output/              # Generated reports
```

### 3. Generate Report

```bash
dproc generate
```

Output:

```
✅ Report generation complete!

📄 Generated files:
  MD     ./output/report.md (3.2 KB)
  HTML   ./output/report.html (8.7 KB)
  PDF    ./output/report.pdf (45.1 KB)

⏱️  Total time: 12.3s
```

### 4. Launch Web UI (Optional)

```bash
dproc serve
```

Access at http://localhost:5555

---

## 🏗️ Architecture

### Data Flow

```
CSV/JSON Input
    ↓
UniversalConnector (auto-detect format)
    ↓
BundleLoader (normalize + validate + stats)
    ↓
FormulaEngine (compute custom fields)
    ↓
EnrichedBundle
    ↓
ReportEngine (LLM + templates)
    ↓
MDXRenderer (optional components)
    ↓
ExportManager (MD/HTML/PDF)
    ↓
Output Files
```

### Component Hierarchy

```
CLI (Commander)
  ├─ Commands
  │   ├─ setup → SecretsManager
  │   ├─ init → Project templates
  │   ├─ generate → ReportEngine
  │   └─ serve → Express server
  │
Core
  ├─ BundleLoader (data processing)
  ├─ ReportEngine (orchestration)
  ├─ LLMClient (AI SDK integration)
  ├─ PromptRenderer (Nunjucks)
  └─ ExportManager (multi-format)
│
Modules
  ├─ Connectors (CSV, JSON)
  ├─ Normalization (auto-clean)
  ├─ Validation (Zod schemas)
  ├─ Prompts (library + composer)
  ├─ MDX (components + renderer)
  └─ Renderers (HTML, PDF)
```

---

## 🖥️ CLI Reference

### Setup & Configuration

```bash
# Initial setup (API keys)
dproc setup

# Switch active provider
dproc use gemini|openai|deepseek

# List configured providers
dproc config list
```

### Project Management

```bash
# Create new project
dproc init  [options]
  -t, --template     Template: sales|generic
  -d, --dir          Custom directory

# Examples
dproc init my-report
dproc init sales-q4 --template sales
```

### Report Generation

```bash
# Generate with all features
dproc generate [options]

Options:
  -c, --config       Config file (default: dproc.config.json)
  -d, --data         Override data source
  -p, --provider     Override LLM provider
  -o, --output        Override output directory
  --no-pdf                 Skip PDF generation
  --processing             Enhanced data processing (default: true)
  --prompt-library         Use prompt library (default: true)
  --validate               Validate variables (default: true)
  --context-management     Manage context window (default: true)
  --structured-parsing     Parse structured output (default: true)
  --context-size     Context window tokens (default: 8000)

# Examples
dproc generate
dproc generate --no-pdf --provider openai
dproc generate -c custom-config.json -d data/Q4.csv
```

### Data Validation

```bash
# Validate dataset before generation
dproc validate

# Output
🔍 Validating: data/sales.csv
✓ File loaded successfully
  Records: 150
  Columns: 8
  date, product, revenue, region, sales_rep, units, discount, category

📊 Column Types:
  🔢 revenue               number
  📅 date                  date
  📝 product               string
  ...

✅ Validation passed!
```

### Web UI

```bash
# Start web interface
dproc serve [options]
  -p, --port         Port (default: 5555)
  --no-open                Don't open browser

# Examples
dproc serve
dproc serve -p 8080 --no-open
```

---

## 🌐 Web UI

### Features

- **Dashboard**: View all projects
- **Project Details**: Manage data sources and reports
- **Report Generation**: One-click generation with progress
- **Report Viewer**: Preview Markdown/HTML with MDX components
- **Settings**: Configure API keys and active provider

### Screenshots

**Projects Dashboard**

- Lists all projects with last modified date
- Quick access to generate/view reports

**Report Viewer**

- Full-width MDX component rendering
- KPI grids with gradient backgrounds
- Interactive data tables
- Styled callouts and metrics

---

## ⚙️ Configuration

### Project Config (`dproc.config.json`)

```json
{
  "reportName": "Sales Performance Report",
  "author": "Data Team",
  "version": "1.0.0",

  "dataSources": ["./data/sales.csv"],

  "fields": {
    "custom": [
      { "name": "company", "value": "Acme Corp" },
      { "name": "period", "value": "Q4 2024" }
    ],
    "computed": [
      { "name": "total_revenue", "function": "SUM(revenue)" },
      { "name": "avg_deal_size", "function": "AVG(revenue)" },
      { "name": "top_product", "function": "TOP(product, revenue, 1)" }
    ]
  },

  "specFile": "./spec.yml",

  "output": {
    "formats": ["md", "html", "pdf"],
    "destination": "./output"
  },

  "llm": {
    "provider": "gemini",
    "model": "gemini-2.0-flash-exp",
    "temperature": 0.7
  }
}
```

### Report Spec (`spec.yml`)

```yaml
id: sales-performance-report
templateFile: ./templates/sales-report.njk

variables:
  - name: executive_summary
    type: markdown
    promptFile: ./prompts/executive-summary.md
    inputs:
      - bundle.samples.main
      - bundle.computedFields
      - bundle.stats

  - name: key_insights
    type: string_list
    promptFile: library:common:extract-entities
    inputs:
      - bundle.records

  - name: recommendations
    type: json
    promptFile: ./prompts/recommendations.md
    inputs:
      - context.executive_summary
      - bundle.stats
```

### Prompt Template (`prompts/executive-summary.md`)

```markdown
# Executive Summary Generation

You are a senior business analyst.

## Performance Metrics

- Total Revenue: ${{total_revenue}}
- Average Deal Size: ${{avg_revenue | round(2)}}
- Top Product: {{top_product}}

## Sample Transactions

{% for record in main %}

- {{record.date}}: {{record.product}} - ${{record.revenue}}
  {% endfor %}

## Instructions

Write a professional 2-paragraph executive summary that:

1. Opens with overall performance assessment
2. Highlights significant trends
3. Mentions top-performing product

Output in markdown format only, 150-200 words.
```

### Report Template (`templates/sales-report.njk`)

```markdown
# 📊 {{reportName}}

**Company:** {{customFields.company}}  
**Period:** {{customFields.period}}  
**Generated:** {{metadata.ingested_at}}

---

## 🎯 Executive Summary

{{executive_summary}}

---

## 📈 Key Metrics

| Metric           | Value                             |
| ---------------- | --------------------------------- | ---------- |
| 💰 Total Revenue | ${{computedFields.total_revenue}} |
| 🏆 Top Product   | {{computedFields.top_product}}    |
| 💵 Avg Deal Size | ${{computedFields.avg_revenue     | round(2)}} |

---

## 📊 Data Overview

- Records: {{metadata.record_count}}
- Columns: {{stats.columnCount}}
```

---

## 🔧 Advanced Usage

### Using Prompt Library

Built-in prompts for common tasks:

```yaml
variables:
  - name: trends
    type: markdown
    promptFile: library:common:analyze-trends

  - name: comparison
    type: markdown
    promptFile: library:common:compare-items

  - name: drug_analysis
    type: markdown
    promptFile: library:domain/biomedical:drug-discovery
```

Available categories:

- `common`: summarize, analyze-trends, compare-items, extract-entities, recommendations
- `domain/biomedical`: drug-discovery, patent-analysis
- `domain/financial`: market-analysis, risk-assessment

### Custom Formulas

Supported functions:

```javascript
// Aggregations
SUM(column)
AVG(column)
COUNT()
MIN(column)
MAX(column)
MEDIAN(column)
MODE(column)
STDEV(column)

// Advanced
TOP(groupColumn, valueColumn, N)
PERCENTILE(column, P)
DISTINCT(column)
PERCENT_CHANGE(valueColumn, periodColumn)
GROUP_BY(groupColumn, aggregation)

// Examples
{ "name": "revenue_sum", "function": "SUM(revenue)" }
{ "name": "top_3_products", "function": "TOP(product, revenue, 3)" }
{ "name": "growth_rate", "function": "PERCENT_CHANGE(revenue, date)" }
```

### MDX Components

Use in templates or AI-generated content:

```jsx
import { KPI, KPIGrid, DataTable, Callout } from '@aganitha/dproc-framework/mdx';

# Report with Components
  Revenue declined 12% vs Q3. Focus on enterprise segment.
```

### Context Management

For large datasets:

```javascript
// Automatic chunking when prompt exceeds context window
const options = {
  manageContext: true,
  contextWindowSize: 8000, // tokens
};

// Framework will:
// 1. Estimate token count
// 2. Truncate or chunk if needed
// 3. Preserve first/last sections
```

### Structured Output Parsing

Extract JSON, tables, or lists from LLM responses:

````javascript
// In spec.yml
variables:
  - name: insights
    type: json
    promptFile: ./prompts/insights.md

// Framework automatically extracts JSON from:
// "Here are the insights: ```json\n{...}\n```"
// Or: "The data shows: {...}"
````

---

## 📚 API Documentation

### Programmatic Usage

```typescript
import {
  BundleLoader,
  ReportEngine,
  AiSdkLlmClient,
  ProjectConfigLoader,
  type EnrichedBundle,
  type ProjectConfig,
} from "@aganitha/dproc-framework";

// 1. Load and process data
const bundleLoader = new BundleLoader();
const bundle = await bundleLoader.loadDatasetWithProcessing("./data/sales.csv");

// 2. Enrich with formulas
const enriched = bundleLoader.enrichBundle(
  bundle,
  [{ name: "company", value: "Acme" }],
  [{ name: "total", function: "SUM(revenue)" }]
);

// 3. Generate report
const llmClient = new AiSdkLlmClient(apiKey, "gemini", "gemini-2.0-flash-exp");
const reportEngine = new ReportEngine(llmClient, {
  usePromptLibrary: true,
  validateVariables: true,
  manageContext: true,
});

const markdown = await reportEngine.generate(config, enriched);

// 4. Export
import { ExportManager } from "@aganitha/dproc-framework";
const exporter = new ExportManager();
await exporter.exportAll(markdown, ["md", "html", "pdf"], "./output");
```

### Core Classes

#### BundleLoader

```typescript
class BundleLoader {
  // Basic loading
  async loadDataset(filePath: string): Promise;

  // Enhanced processing (validation + normalization + stats)
  async loadDatasetWithProcessing(filePath: string): Promise;

  // Add custom/computed fields
  enrichBundle(
    bundle: Bundle,
    customFields?: CustomField[],
    computedFields?: ComputedField[]
  ): EnrichedBundle;
}
```

#### ReportEngine

```typescript
class ReportEngine {
  constructor(llmClient: LLMClient, options?: ReportGenerationOptions);

  async generate(
    config: ProjectConfig,
    bundle: EnrichedBundle,
    options?: ReportGenerationOptions
  ): Promise;

  // Convenience methods
  async generateWithLibrary(
    bundle: EnrichedBundle,
    category: string,
    promptName: string,
    template: string
  ): Promise;

  async generateMultiStep(
    bundle: EnrichedBundle,
    steps: Array,
    template: string
  ): Promise;
}
```

#### ExportManager

```typescript
class ExportManager {
  async exportAll(
    markdown: string,
    formats: ExportFormat[],
    outputDir: string,
    options?: { filename?: string; metadata?: any }
  ): Promise<Record>;
}

type ExportFormat = "md" | "html" | "pdf" | "mdx" | "json";
```

---

## 📖 Examples

### Example 1: Sales Analysis

```bash
# Create project
dproc init sales-analysis --template sales

# Customize data
cp ~/Downloads/Q4-sales.csv sales-analysis/data/

# Update config
cd sales-analysis
vim dproc.config.json  # Point to your CSV

# Generate
dproc generate
```

### Example 2: Custom Healthcare Report

**dproc.config.json**

```json
{
  "reportName": "Hospital Performance Dashboard",
  "dataSources": ["./data/patient-data.csv"],
  "fields": {
    "computed": [
      { "name": "avg_stay", "function": "AVG(length_of_stay)" },
      {
        "name": "readmission_rate",
        "function": "PERCENT_CHANGE(readmissions, date)"
      }
    ]
  },
  "specFile": "./spec.yml",
  "output": { "formats": ["html", "pdf"], "destination": "./output" }
}
```

**spec.yml**

```yaml
variables:
  - name: summary
    type: markdown
    promptFile: ./prompts/summary.md
    inputs: [bundle.stats, bundle.computedFields]
```

**prompts/summary.md**

```markdown
Analyze hospital performance:

- Average Length of Stay: {{avg_stay}} days
- Readmission Rate Change: {{readmission_rate}}%

Provide 3-paragraph analysis covering:

1. Overall performance vs benchmarks
2. Key risk areas
3. Recommendations for improvement
```

### Example 3: Programmatic Generation

```typescript
import {
  BundleLoader,
  ReportEngine,
  AiSdkLlmClient,
  PromptLibrary,
} from "@aganitha/dproc-framework";

const loader = new BundleLoader();
const bundle = await loader.loadDatasetWithProcessing("./sales.csv");

const enriched = loader.enrichBundle(
  bundle,
  [],
  [{ name: "total_revenue", function: "SUM(revenue)" }]
);

const llm = new AiSdkLlmClient(
  process.env.GEMINI_KEY,
  "gemini",
  "gemini-2.0-flash-exp"
);
const engine = new ReportEngine(llm);

// Use multi-step generation
const markdown = await engine.generateMultiStep(
  enriched,
  [
    { category: "common", name: "summarize" },
    { category: "common", name: "analyze-trends" },
    { category: "common", name: "recommendations" },
  ],
  "./templates/report.njk"
);

console.log(markdown);
```

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test:unit

# Validate package
pnpm verify

# Test CLI locally
npm link
dproc init test-project
cd test-project
dproc generate
```

---

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/mdharwad/dproc-framework.git
cd dproc-framework

# Install dependencies
pnpm install

# Build
pnpm build

# Run CLI in dev mode
pnpm dev:cli -- generate

# Run web UI in dev mode
pnpm dev:web
```

### Project Structure

```
dproc-framework/
├── src/
│   ├── cli/              # CLI commands
│   ├── core/             # Core engine
│   ├── connectors/       # Data loaders
│   ├── normalization/    # Data cleaning
│   ├── validation/       # Schema inference
│   ├── prompts/          # Prompt library
│   ├── mdx/              # MDX components
│   ├── renderers/        # Export formats
│   └── server/           # Web API
├── web/                  # React UI
├── bin/                  # CLI entry point
└── dist/                 # Build output
```

### Adding New Features

1. **New Connector**: Extend `src/connectors/`
2. **New Formula**: Add to `FormulaEngine`
3. **New Prompt**: Add to `src/prompts/templates/`
4. **New Component**: Add to `src/mdx/components/`
5. **New Export Format**: Extend `ExportManager`

---

## 🆘 Support

- **Issues**: https://github.com/mdharwad/dproc-framework/issues
- **Email**: mdharwad@aganitha.ai
- **Documentation**: https://github.com/mdharwad/dproc-framework/wiki

---

## 🗺️ Roadmap

### v0.2.0

- [ ] Real-time chart rendering with Recharts
- [ ] Database connectors (PostgreSQL, MySQL, MongoDB)
- [ ] Template marketplace
- [ ] Docker support

### v0.3.0

- [ ] Scheduled report generation
- [ ] Email delivery integration
- [ ] Multi-language support
- [ ] Cloud storage integration (S3, GCS)

---

## 📊 Changelog

### v0.1.0 (Initial Release)

- ✅ Multi-LLM support (Gemini, OpenAI, DeepSeek)
- ✅ CSV/JSON connectors
- ✅ Enhanced data processing
- ✅ Prompt library with 10+ templates
- ✅ MDX components (KPI, DataTable, Callout)
- ✅ Multi-format export (MD, HTML, PDF)
- ✅ Web UI with report viewer
- ✅ CLI with 7 commands

---

**Built with ❤️ by the Aganitha Data Team**
