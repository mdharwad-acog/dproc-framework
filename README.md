# dproc-framework

> **⚠️ Training Project Notice**: This framework is designed as a learning and experimentation tool. While functional, it is **not recommended for production environments**. Use it to explore LLM-powered data processing patterns, experiment with report generation, and learn about AI SDK integration.

**LLM-powered data processing and report generation framework**

Transform datasets (CSV, JSON) into AI-generated, structured reports with multi-format export (Markdown, HTML, PDF) and interactive MDX components.

---

## 🎯 What is dproc-framework?

dproc-framework is an experimental toolkit that demonstrates how to:

- Process tabular data with automatic normalization and validation
- Generate natural language reports using Large Language Models
- Create interactive data visualizations with MDX components
- Export to multiple formats with a unified pipeline

**Best suited for**: Learning projects, data analysis prototypes, report generation experiments, and exploring AI SDK capabilities.

---

## ✨ Features

### Core Capabilities

- **Multi-LLM Support**: Gemini, OpenAI, DeepSeek with automatic provider switching
- **Universal Data Connectors**: Load CSV and JSON with auto-detection
- **AI-Powered Report Generation**: Natural language prompts → structured reports
- **Multi-Format Export**: Markdown, HTML, PDF, MDX
- **Interactive Components**: KPIs, charts, tables, callouts via MDX
- **Web UI**: Browser-based project management and report viewer
- **CLI Tools**: 7 commands for project lifecycle management

### Advanced Features

- **Enhanced Data Processing**: Auto schema inference, field normalization, comprehensive statistics
- **Prompt Library**: 10+ built-in templates for common analysis tasks
- **Context Management**: Automatic handling of large datasets within LLM token limits
- **Structured Output Parsing**: Extract JSON, tables, lists from LLM responses
- **Formula Engine**: 14 built-in functions (SUM, AVG, TOP, PERCENTILE, etc.)

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [CLI Commands](#-cli-commands)
- [Configuration](#-configuration)
- [API Usage](#-programmatic-api)
- [Examples](#-examples)
- [Limitations](#-limitations)
- [Contributing](#-contributing)

---

## 📦 Installation

### From Aganitha NPM Registry

```bash
npm install -g @aganitha/dproc-framework
```

### Verify Installation

```bash
dproc --version
# Output: 1.0.0
```

### Prerequisites

- **Node.js**: ≥18.0.0
- **pnpm**: ≥8.0.0 (recommended for development)
- **API Keys**: At least one of:
  - [Gemini API](https://makersuite.google.com/app/apikey)
  - [OpenAI API](https://platform.openai.com/api-keys)
  - [DeepSeek API](https://platform.deepseek.com)

---

## 🚀 Quick Start

### 1. Configure API Keys

```bash
dproc setup
```

Follow the interactive prompts to enter your API keys. Keys are securely stored in `~/.aganitha/.llm-framework/secrets.json` with restricted permissions.

### 2. Create Your First Project

```bash
dproc init sales-report --template sales
cd sales-report
```

This generates a complete project structure:

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

### 3. Generate Your First Report

```bash
dproc generate
```

**Output:**

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

Access the web interface at http://localhost:5555 to:

- Browse projects
- Generate reports with one click
- Preview reports with rendered MDX components
- Manage API keys

---

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[Full Documentation](./README.md)** - Complete reference (this file)
- **[Changelog](./CHANGELOG.md)** - Version history and updates

---

## 🏗️ Project Structure

### Configuration Files

**dproc.config.json** - Project settings

```json
{
  "reportName": "Sales Performance Report",
  "dataSources": ["./data/sales.csv"],
  "fields": {
    "custom": [{ "name": "company", "value": "Acme Corp" }],
    "computed": [{ "name": "total_revenue", "function": "SUM(revenue)" }]
  },
  "specFile": "./spec.yml",
  "output": {
    "formats": ["md", "html", "pdf"],
    "destination": "./output"
  }
}
```

**spec.yml** - Report structure

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
```

### Directory Layout

```
project/
├── dproc.config.json    # Main configuration
├── spec.yml             # Report specification
├── data/                # Your datasets
├── prompts/             # AI prompt templates
├── templates/           # Report templates (Nunjucks)
└── output/              # Generated reports
```

---

## 🖥️ CLI Commands

### Setup & Configuration

```bash
# Initial setup - configure API keys
dproc setup

# Switch active LLM provider
dproc use gemini|openai|deepseek

# List configured providers
dproc config list
```

### Project Management

```bash
# Create new project
dproc init <project-name> [options]

Options:
  -t, --template <type>    Template type: sales|generic
  -d, --dir <directory>    Custom directory

# Examples
dproc init my-report
dproc init quarterly-sales --template sales
```

### Report Generation

```bash
# Generate report with all features
dproc generate [options]

Options:
  -c, --config <path>      Config file (default: dproc.config.json)
  -d, --data <path>        Override data source
  -p, --provider <name>    Override LLM provider
  -o, --output <dir>       Override output directory
  --no-pdf                 Skip PDF generation
  --processing             Enhanced data processing (default: true)
  --prompt-library         Use prompt library (default: true)
  --context-management     Manage context window (default: true)
  --context-size <size>    Context window tokens (default: 8000)

# Examples
dproc generate
dproc generate --no-pdf --provider openai
dproc generate -c custom-config.json
```

### Data Validation

```bash
# Validate dataset structure
dproc validate <file>

# Output example
🔍 Validating: data/sales.csv
✓ File loaded successfully
  Records: 150
  Columns: 8
  date, product, revenue, region, sales_rep

📊 Column Types:
  🔢 revenue    number
  📅 date       date
  📝 product    string

✅ Validation passed!
```

### Web Interface

```bash
# Start web server
dproc serve [options]

Options:
  -p, --port <port>    Port number (default: 5555)
  -h, --host <host>    Host to bind to (default: localhost)
  --no-open            Don't open browser automatically

# Examples
dproc serve
dproc serve -p 8080 --host 0.0.0.0
```

---

## ⚙️ Configuration

### Custom Fields

Add static values to your reports:

```json
{
  "fields": {
    "custom": [
      { "name": "company", "value": "Acme Corp" },
      { "name": "period", "value": "Q4 2024" },
      { "name": "report_date", "value": "2024-12-10" }
    ]
  }
}
```

Access in templates: `{{customFields.company}}`

### Computed Fields (Formulas)

Calculate values from your data:

```json
{
  "fields": {
    "computed": [
      { "name": "total_revenue", "function": "SUM(revenue)" },
      { "name": "avg_deal_size", "function": "AVG(revenue)" },
      { "name": "top_product", "function": "TOP(product, revenue, 1)" },
      { "name": "growth_rate", "function": "PERCENT_CHANGE(revenue, date)" }
    ]
  }
}
```

**Available Functions:**

- Aggregations: `SUM`, `AVG`, `COUNT`, `MIN`, `MAX`
- Statistics: `MEDIAN`, `MODE`, `STDEV`, `PERCENTILE`
- Advanced: `TOP`, `DISTINCT`, `PERCENT_CHANGE`, `GROUP_BY`

### Prompt Library

Use pre-built prompts for common tasks:

```yaml
variables:
  - name: analysis
    type: markdown
    promptFile: library:common:analyze-trends
    inputs: [bundle.records]
```

**Categories:**

- `common`: summarize, analyze-trends, compare-items, extract-entities, recommendations
- `domain/biomedical`: drug-discovery, patent-analysis
- `domain/financial`: market-analysis, risk-assessment

---

## 💻 Programmatic API

Use dproc-framework in your own applications:

```typescript
import {
  BundleLoader,
  ReportEngine,
  AiSdkLlmClient,
  ProjectConfigLoader,
  ExportManager,
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

const config = ProjectConfigLoader.load("./dproc.config.json");
const markdown = await reportEngine.generate(config, enriched);

// 4. Export to formats
const exporter = new ExportManager();
await exporter.exportAll(markdown, ["md", "html", "pdf"], "./output");
```

### Core Classes

**BundleLoader** - Data loading and processing

```typescript
class BundleLoader {
  async loadDataset(filePath: string): Promise<Bundle>;
  async loadDatasetWithProcessing(filePath: string): Promise<Bundle>;
  enrichBundle(bundle: Bundle, customFields?, computedFields?): EnrichedBundle;
}
```

**ReportEngine** - Report generation

```typescript
class ReportEngine {
  constructor(llmClient: LLMClient, options?: ReportGenerationOptions);
  async generate(
    config: ProjectConfig,
    bundle: EnrichedBundle
  ): Promise<string>;
}
```

**ExportManager** - Multi-format export

```typescript
class ExportManager {
  async exportAll(
    markdown: string,
    formats: ExportFormat[],
    outputDir: string
  ): Promise<Record<string, string>>;
}

type ExportFormat = "md" | "html" | "pdf" | "mdx" | "json";
```

---

## 📖 Examples

### Example 1: Basic Sales Report

```bash
# Create project
dproc init sales-analysis --template sales

# Replace sample data with your own
cp ~/Downloads/Q4-sales.csv sales-analysis/data/

# Generate report
cd sales-analysis
dproc generate
```

### Example 2: Custom Healthcare Report

**dproc.config.json:**

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
  "output": { "formats": ["html", "pdf"] }
}
```

### Example 3: Multi-Step Analysis

```typescript
import { ReportEngine, PromptLibrary } from "@aganitha/dproc-framework";

const markdown = await reportEngine.generateMultiStep(
  bundle,
  [
    { category: "common", name: "summarize" },
    { category: "common", name: "analyze-trends" },
    { category: "common", name: "recommendations" },
  ],
  "./templates/report.njk"
);
```

---

## ⚠️ Limitations

As a training project, dproc-framework has intentional limitations:

### Data Processing

- **File Size**: Best for datasets under 10MB
- **Format Support**: CSV and JSON only (no databases)
- **Schema Inference**: Heuristic-based, may misidentify types
- **Normalization**: Basic patterns only, domain-specific logic needed for complex cases

### LLM Integration

- **Context Window**: Hard limit at 8000 tokens by default
- **Rate Limiting**: No built-in retry logic beyond 3 attempts
- **Response Parsing**: May fail on unconventional LLM outputs
- **Prompt Engineering**: Templates are generic, not optimized per domain

### Report Generation

- **MDX Components**: Limited to 6 built-in components
- **PDF Generation**: Requires Playwright/Chromium (slow startup)
- **Styling**: Basic CSS only, no advanced theming
- **Interactivity**: Charts are placeholders, no real-time rendering

### Web UI

- **Security**: No authentication, intended for local use only
- **Concurrency**: Single-user design, no session management
- **State Management**: In-memory only, no persistence
- **Error Handling**: Basic error messages, limited debugging

### Production Readiness

- ❌ No authentication/authorization
- ❌ No database integration
- ❌ No background job processing
- ❌ No monitoring/observability
- ❌ No comprehensive test coverage
- ❌ No performance optimization for large datasets

**Use this framework to learn patterns, not as a production solution.**

---

## 🧪 Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/mdharwad/dproc-framework.git
cd dproc-framework

# Install dependencies
pnpm install

# Build
pnpm build

# Run CLI in development
pnpm dev:cli -- generate

# Run web UI in development
pnpm dev:web
```

### Project Structure

```
dproc-framework/
├── src/
│   ├── cli/              # CLI commands
│   ├── core/             # Core engine (bundle, report, LLM)
│   ├── connectors/       # Data loaders (CSV, JSON)
│   ├── normalization/    # Data cleaning utilities
│   ├── validation/       # Schema inference
│   ├── prompts/          # Prompt library & composers
│   ├── mdx/              # MDX components & renderer
│   ├── renderers/        # Export formats (HTML, PDF)
│   └── server/           # Web API
├── web/                  # React UI (Vite)
├── bin/                  # CLI entry point
└── dist/                 # Build output
```

### Running Tests

```bash
# Run unit tests
pnpm test:unit

# Verify package
pnpm verify
```

---

## 🐳 Docker Support

```bash
# Build image
docker build -t dproc-framework .

# Run with Docker Compose
docker-compose up -d

# Access at http://localhost:5555
```

The container mounts `~/dproc-workspace` for persistent projects.

---

## 🤝 Contributing

Contributions are welcome! This is a learning project, so:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Guidelines

- Focus on educational value over production features
- Document your changes clearly
- Add examples for new features
- Keep dependencies minimal

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/mdharwad/dproc-framework/issues)
- **Email**: mdharwad@aganitha.ai
- **Documentation**: This README and [QUICKSTART.md](./QUICKSTART.md)

---

## 🙏 Acknowledgments

Built as a training project to explore:

- LLM integration patterns with Vercel AI SDK
- Data processing pipelines
- Report generation workflows
- MDX component systems

**Not affiliated with**: OpenAI, Google, DeepSeek, or any LLM provider.

_Remember: This is a learning tool. For production needs, consider established platforms like Jupyter, Streamlit, or commercial BI solutions._
