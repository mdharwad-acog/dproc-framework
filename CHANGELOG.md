# Changelog

All notable changes to dproc-framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-09

### Added

#### Core Features

- Multi-LLM provider support (Gemini, OpenAI, DeepSeek)
- Universal data connectors (CSV, JSON)
- AI-powered report generation with Nunjucks templating
- Multi-format export (Markdown, HTML, PDF)
- CLI with 7 commands: setup, init, generate, validate, serve, use, config
- Web UI for project management and report viewing

#### Phase 1: Enhanced Data Processing

- `BundleLoader.loadDatasetWithProcessing()` - Full pipeline
- `AutoNormalizer` - Domain-specific field normalization
- `SchemaInferrer` - Automatic Zod schema generation
- `StatsCalculator` - Comprehensive statistics (distributions, ranges, column stats)
- `DataValidator` - Type inference and validation

#### Phase 2: Advanced Prompting

- Prompt library with 10+ templates (common + domain-specific)
- `PromptComposer` - Multi-step prompt chaining
- `ContextManager` - Automatic context window management
- `StructuredParser` - Extract JSON, tables, lists from LLM responses
- `VariableValidator` - Input validation before rendering

#### Phase 3: MDX Components

- `MDXRenderer` - Server-side rendering
- 6 built-in components: KPI, KPIGrid, DataTable, Chart, Callout, Metric
- Component registry system
- CSS styling with dark mode support

#### Formula Engine

- 14 formula functions: SUM, AVG, COUNT, MIN, MAX, MEDIAN, MODE, STDEV, PERCENTILE, DISTINCT, TOP, PERCENT_CHANGE, GROUP_BY

#### Web UI Features

- Projects dashboard
- Report viewer with full MDX rendering
- Settings page for API key management
- Responsive design with Tailwind CSS

#### Developer Experience

- TypeScript with full type definitions
- Modular architecture with clear separation of concerns
- Comprehensive error handling with debug logging
- Programmatic API for custom integrations

### Fixed

- Fixed MDX component rendering in report viewer
- Fixed PDF generation with Playwright
- Fixed context window overflow for large datasets
- Fixed structured output parsing for edge cases

### Security

- API keys stored securely in home directory
- File permissions set to 0600 for secrets.json
- Input validation for all user-provided data

---

## [Unreleased]

### Planned for v0.2.0

- Real-time chart rendering with Recharts
- Database connectors (PostgreSQL, MySQL, MongoDB)
- Scheduled report generation
- Email delivery integration
- Template marketplace
- Docker support

---

[0.1.0]: https://npm.aganitha.ai/-/web/detail/@aganitha/dproc-framework/v/0.1.0
