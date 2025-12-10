# Changelog

All notable changes to dproc-framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-12-10

### 🎉 Initial Release

First stable release of dproc-framework, an LLM-powered data processing and report generation toolkit designed for learning and experimentation.

**⚠️ Training Project Notice**: This release is intended for educational purposes, prototyping, and experimentation. Not recommended for production environments.

### Added

#### Core Features

- **Multi-LLM Provider Support**

  - Gemini (Google Generative AI)
  - OpenAI (GPT models)
  - DeepSeek (DeepSeek Chat)
  - Automatic provider switching via CLI
  - Configurable default models per provider

- **Universal Data Connectors**

  - CSV file support with automatic type inference
  - JSON file support with nested path extraction
  - Auto-detection of file format based on extension
  - Synchronous and asynchronous loading options

- **AI-Powered Report Generation**

  - Natural language prompt templates using Nunjucks
  - Structured output parsing (JSON, tables, lists)
  - Multi-step reasoning with prompt chaining
  - Context window management for large datasets
  - Variable validation before rendering

- **Multi-Format Export**

  - Markdown (.md) - Plain text reports
  - HTML (.html) - Styled web reports with CSS themes
  - PDF (.pdf) - Print-ready documents via Playwright
  - MDX (.mdx) - Interactive component-enabled reports
  - JSON (.json) - Structured data export

- **CLI with 7 Commands**

  - `dproc setup` - Configure API keys interactively
  - `dproc init` - Create new projects from templates
  - `dproc generate` - Generate reports with all features
  - `dproc validate` - Validate dataset structure and types
  - `dproc serve` - Launch web UI server
  - `dproc use` - Switch active LLM provider
  - `dproc config` - Manage configuration settings

- **Web UI**
  - Projects dashboard with real-time status
  - One-click report generation with progress tracking
  - Report preview with rendered MDX components
  - Settings page for API key management
  - Responsive design with Tailwind CSS
  - Built with Vite + React + TypeScript

#### Phase 1: Enhanced Data Processing

- **BundleLoader with Multiple Loading Modes**

  - `loadDataset()` - Basic loading with stats
  - `loadDatasetWithValidation()` - With schema validation
  - `loadDatasetWithNormalization()` - With field cleaning
  - `loadDatasetWithProcessing()` - Full pipeline (validation + normalization + enhanced stats)
  - `loadDatasetWithProgressTracking()` - With progress callbacks

- **AutoNormalizer**

  - Domain-specific field normalization
  - Automatic detection of date, numeric, percentage, array, and text fields
  - Pattern-based field type inference
  - Support for MeSH terms, CPC codes, and other domain formats

- **SchemaInferrer**

  - Automatic Zod schema generation from sample data
  - Type inference: string, number, boolean, date, array, object
  - Email, URL, and date pattern detection
  - Enum detection for limited value sets
  - Human-readable schema descriptions

- **SchemaRegistry**

  - In-memory schema storage with metadata
  - File-based schema caching (`.dproc/schemas/`)
  - Schema versioning with timestamps
  - Schema listing and retrieval

- **StatsCalculator**

  - Comprehensive column statistics (null counts, unique values, fill rates)
  - Value distributions with top 10 frequencies
  - Numeric ranges (min, max, mean, median, stdDev)
  - Date ranges (earliest, latest, span in days)
  - Type inference per column

- **DataValidator**
  - Record count validation
  - Required column checking
  - Automatic column type inference
  - Date string pattern matching

#### Phase 2: Advanced Prompting

- **Prompt Library**

  - 10+ pre-built templates organized by category
  - Common prompts: summarize, analyze-trends, compare-items, extract-entities, recommendations
  - Domain-specific prompts:
    - `domain/biomedical`: drug-discovery, patent-analysis
    - `domain/financial`: market-analysis, risk-assessment
  - Template loading via `library:category:name` syntax
  - Custom prompt creation utility

- **PromptComposer**

  - Multi-step prompt chaining
  - Sequential reasoning workflows
  - Context preservation across steps
  - Step-by-step execution with intermediate results

- **ContextManager**

  - Token count estimation (1 token ≈ 4 characters)
  - Automatic text truncation to fit context window
  - Smart chunking by paragraphs with overlap
  - Context usage percentage calculation
  - Configurable context window size (default: 8000 tokens)

- **StructuredParser**

  - JSON extraction from markdown code blocks
  - Robust fallback to inline JSON detection
  - List extraction from markdown bullet points
  - Table extraction from markdown tables
  - Section extraction with header detection
  - Numbered item parsing with descriptions
  - Key-value pair extraction

- **VariableValidator**

  - Type validation with Zod schemas
  - Required field checking
  - Text field length validation (min/max)
  - Array size validation
  - Comprehensive validation with multiple rules

- **PromptValidator**
  - Variable presence validation
  - Type checking with Zod
  - Text field constraints
  - Array constraints

#### Phase 3: MDX Components

- **MDXRenderer**

  - Server-side rendering with @mdx-js/mdx
  - Component registry system
  - React SSR with renderToStaticMarkup
  - Mixed markdown/MDX detection and handling
  - CSS injection for component styling

- **ComponentRegistry**

  - Dynamic component registration
  - Built-in component loading
  - Component listing and availability checking
  - Custom component support

- **6 Built-in MDX Components**

  - **KPI**: Single metric card with icon, value, and trend indicator
  - **KPIGrid**: Responsive grid layout for multiple KPIs (2, 3, or 4 columns)
  - **DataTable**: Interactive table with sorting, searching, and pagination
  - **Chart**: Placeholder for bar, line, pie, and scatter charts (v0.2.0: full Recharts integration)
  - **Callout**: Styled alert boxes (info, warning, success, error)
  - **Metric**: Inline metric display with label and value

- **Component Styling**
  - Professional CSS with gradient backgrounds
  - Hover effects and transitions
  - Dark mode support (media query)
  - Print-optimized styles
  - Responsive breakpoints

#### Formula Engine

- **14 Formula Functions**
  - Aggregations: `SUM`, `AVG`, `COUNT`, `MIN`, `MAX`
  - Statistics: `MEDIAN`, `MODE`, `STDEV`, `PERCENTILE`
  - Advanced: `TOP`, `DISTINCT`, `PERCENT_CHANGE`, `GROUP_BY`
  - Support for nested calculations
  - Type coercion and error handling

#### Web UI Features

- **Projects Dashboard**

  - Grid layout with project cards
  - Last modified timestamps
  - Output format badges
  - Quick navigation to project details

- **Report Viewer**

  - Full MDX component rendering
  - Inline CSS with gradient KPI cards
  - Interactive data tables
  - PDF download button
  - Responsive layout

- **Settings Page**

  - Provider status indicators
  - API key configuration (password fields)
  - Default model selection per provider
  - Active provider switching
  - Success/error feedback

- **Generation Progress**
  - Real-time status updates
  - Animated loading indicators
  - Success confirmation with auto-redirect
  - Error display with helpful messages

#### Developer Experience

- **TypeScript Support**

  - Full type definitions for all APIs
  - Strict type checking enabled
  - IntelliSense support in IDEs
  - Type exports for external usage

- **Modular Architecture**

  - Clear separation of concerns
  - Pluggable LLM providers
  - Extensible data connectors
  - Custom prompt support

- **Comprehensive Error Handling**

  - Try-catch wrappers on all async operations
  - User-friendly error messages
  - Debug logging with `debug` package
  - Non-retryable error detection (auth failures, invalid models)

- **Programmatic API**
  - Importable core classes
  - Chainable method patterns
  - Async/await support
  - Event-based progress tracking

#### Configuration System

- **Project Configuration** (`dproc.config.json`)

  - Report metadata (name, author, version)
  - Data source paths
  - Custom fields (static values)
  - Computed fields (formulas)
  - Spec file reference
  - Output formats and destination
  - LLM settings override

- **Report Specification** (`spec.yml`)

  - Template file reference
  - Variable definitions with types
  - Prompt file paths (file or library)
  - Input mapping from bundle

- **Secrets Management**

  - Secure storage in `~/.aganitha/.llm-framework/secrets.json`
  - File permissions set to 0600 (owner read/write only)
  - Per-provider API keys and default models
  - Active provider tracking

- **Framework Defaults**
  - Default LLM settings (provider, model, temperature, maxTokens)
  - Default paths (prompts, templates, data, output)
  - Configurable via ConfigManager singleton

#### Documentation

- **README.md** - Comprehensive guide with examples
- **QUICKSTART.md** - 5-minute getting started guide
- **CHANGELOG.md** - Version history (this file)
- **Inline Code Comments** - JSDoc-style documentation
- **TypeScript Definitions** - Self-documenting API

#### Testing & Quality

- **Unit Test Structure** - Test files in `tests/unit/`
- **Package Verification** - `pnpm verify` for dry-run packaging
- **Type Checking** - Strict TypeScript compilation
- **Code Organization** - Consistent file structure and naming

### Fixed

- **MDX Component Rendering**

  - Fixed component imports in report viewer
  - Resolved React SSR hydration issues
  - Corrected CSS injection for styled components

- **PDF Generation**

  - Fixed Playwright browser launch in production
  - Resolved path resolution for Chromium binary
  - Fixed wait conditions for network idle

- **Context Window Management**

  - Fixed token estimation for large prompts
  - Corrected chunking overlap calculation
  - Fixed paragraph boundary detection

- **Structured Output Parsing**

  - Fixed JSON extraction from markdown fences
  - Improved regex for nested JSON objects
  - Fixed fallback to inline JSON detection
  - Resolved code block language tag handling

- **Data Loading**
  - Fixed CSV parsing with inconsistent delimiters
  - Corrected JSON nested path extraction
  - Fixed file existence checks before loading

### Security

- **API Key Storage**

  - Secure file permissions (0600) for secrets.json
  - API keys never logged or exposed in errors
  - Password-type inputs in web UI settings

- **Input Validation**

  - All user-provided file paths validated
  - CLI arguments sanitized
  - Formula syntax validated before execution
  - Schema validation on all configuration files

- **Web Server**
  - CORS enabled for development
  - No authentication (local use only warning)
  - File downloads validated against project scope

### Performance

- **Optimizations**

  - Chunked data loading for large files
  - Incremental stats calculation
  - Cached schema inference results
  - Lazy component loading in web UI

- **Resource Management**
  - Browser cleanup after PDF generation
  - File handle closure after reads
  - Memory-efficient data sampling

### Dependencies

- **Core**

  - `ai@5.0.108` - Vercel AI SDK
  - `@ai-sdk/google@2.0.44` - Gemini provider
  - `@ai-sdk/openai@2.0.77` - OpenAI provider
  - `zod@4.1.13` - Schema validation

- **Data Processing**

  - `csv-parse@6.1.0` - CSV parsing
  - `yaml@2.8.2` - YAML configuration

- **Report Generation**

  - `nunjucks@3.2.4` - Template engine
  - `marked@17.0.1` - Markdown to HTML
  - `@mdx-js/mdx@3.1.1` - MDX compilation
  - `playwright@1.57.0` - PDF generation

- **CLI**

  - `commander@14.0.2` - CLI framework
  - `inquirer@13.0.2` - Interactive prompts
  - `chalk@5.6.2` - Terminal colors
  - `ora@9.0.0` - Spinners

- **Web UI**
  - `react@19.2.1` - UI framework
  - `react-router-dom@7.10.1` - Routing
  - `vite@6.4.1` - Build tool
  - `tailwindcss@4.1.17` - Styling

---

## [Unreleased]

### Planned for v0.2.0 (Q1 2025)

- **Real-time Chart Rendering**

  - Full Recharts integration for Chart component
  - Bar, line, pie, scatter chart support
  - Interactive tooltips and legends
  - Responsive chart sizing

- **Database Connectors**

  - PostgreSQL support
  - MySQL support
  - MongoDB support
  - Connection pooling and retry logic

- **Advanced Features**
  - Scheduled report generation (cron-like)
  - Email delivery integration (SMTP)
  - Template marketplace (community templates)
  - Docker support (production-grade images)

### Planned for v0.3.0 (Q2 2025)

- **Enterprise Features**

  - Multi-user support with authentication
  - Role-based access control (RBAC)
  - Report versioning and history
  - Background job processing

- **Cloud Integration**

  - AWS S3 storage for outputs
  - Google Cloud Storage support
  - Azure Blob Storage support
  - Cloud database connectors

- **Internationalization**
  - Multi-language support (i18n)
  - Date/number formatting per locale
  - Translated UI components

### Known Issues

- **Large Datasets**: Performance degrades above 50MB due to in-memory processing
- **PDF Generation**: First PDF generation is slow (~5s) due to Chromium startup
- **MDX Components**: Charts are placeholders until v0.2.0
- **Web UI**: No authentication, only suitable for local development
- **Context Window**: Hard-coded 8000 token limit may be insufficient for complex reports
- **Error Messages**: Some LLM errors lack helpful context for debugging

### Breaking Changes

None - this is the initial release.

---

## Release Notes

### Version History

- **v1.0.0** (2024-12-10) - Initial stable release
- **v0.1.0** (2024-12-09) - Beta release (internal)

### Migration Guide

Not applicable for initial release.

### Upgrade Instructions

```bash
# Install latest version
npm install -g @aganitha/dproc-framework@latest

# Verify installation
dproc --version

# Existing projects should work without changes
```

---

## Links

- **NPM Package**: https://npm.aganitha.ai/-/web/detail/@aganitha/dproc-framework
- **GitHub Repository**: https://github.com/mdharwad/dproc-framework
- **Issue Tracker**: https://github.com/mdharwad/dproc-framework/issues
- **Documentation**: [README.md](./README.md) | [QUICKSTART.md](./QUICKSTART.md)

---

**Contact**: mdharwad@aganitha.ai
