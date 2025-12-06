import { Command } from "commander";
import inquirer from "inquirer";
import { writeFileSync, mkdirSync, existsSync, cpSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import * as YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const initCommand = new Command("init")
  .description("Initialize a new report project")
  .argument("[name]", "Project name", "my-report")
  .option("-t, --template <type>", "Template type (sales|generic)")
  .action(async (name: string, options: { template?: string }) => {
    console.log(chalk.blue(`\n🚀 Initializing project: ${name}\n`)); // Corrected emoji

    const projectDir = join(process.cwd(), name);

    if (existsSync(projectDir)) {
      console.error(chalk.red(`✖ Directory ${name} already exists`)); // Corrected emoji
      process.exit(1);
    }

    // Ask for template if not specified
    let templateType = options.template || "generic";

    if (!options.template) {
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "template",
          message: "Select a report template:",
          choices: [
            {
              name: "📈 Sales Performance Report - Revenue, growth, product analysis", // Corrected emoji
              value: "sales",
            },
            {
              name: "📝 Generic Report - Start from scratch", // Corrected emoji
              value: "generic",
            },
          ],
        },
      ]);
      templateType = answer.template;
    }

    // Create directory structure
    mkdirSync(projectDir, { recursive: true });
    mkdirSync(join(projectDir, "data"));
    mkdirSync(join(projectDir, "prompts"));
    mkdirSync(join(projectDir, "templates"));
    mkdirSync(join(projectDir, "output"));

    if (templateType === "sales") {
      // Sales template
      createSalesProject(projectDir, name);
    } else {
      // Generic template
      createGenericProject(projectDir, name);
    }

    // Create README
    // SYNTACTICAL ERROR CORRECTED HERE
    const readme = [
      `# LLM Data Report: ${name}`, // Added dynamic header
      "",
      "This is an LLM Data Framework project.",
      "",
      "## Getting Started",
      "",
      "1. Install dependencies and set up the environment:",
      "   ```bash",
      "   llm-framework setup",
      "   ```",
      "",
      "2. Add your data to `data/` directory",
      "",
      "3. Generate report:",
      "   ```bash",
      "   llm-framework generate",
      "   ```",
      "",
      "## Files",
      "",
      "- `llm-framework.config.json` - Data sources and field definitions",
      "- `spec.yml` - Report structure and LLM variables",
      "- `prompts/` - LLM prompt templates",
      "- `templates/` - Report layout templates",
      "- `data/` - Your datasets",
      "- `output/` - Generated reports",
      "",
      "## Customize",
      "",
      "Edit files to:",
      "- Change data sources in config",
      "- Add custom/computed fields in config",
      "- Modify report structure in spec.yml",
      "- Adjust prompts for better output",
      "- Update template layout",
    ].join("\n");

    writeFileSync(join(projectDir, "README.md"), readme);

    console.log(chalk.green(`✅ Project created: ${name}/\n`)); // Corrected emoji
    console.log(chalk.blue("📂 Structure:")); // Corrected emoji
    console.log(`  ${name}/`);
    console.log(`  ├── llm-framework.config.json`); // Corrected structure character
    console.log(`  ├── spec.yml`);
    console.log(`  ├── data/`);
    console.log(`  ├── prompts/`);
    console.log(`  ├── templates/`);
    console.log(`  └── output/\n`); // Corrected structure character

    console.log(chalk.blue("➡️ Next steps:")); // Corrected emoji
    console.log(`  cd ${name}`);
    console.log(
      `  llm-framework setup          # Configure API keys (if needed)`
    );
    console.log(`  llm-framework generate       # Generate report\n`);
  });

function createGenericProject(projectDir: string, name: string) {
  // Config
  const config = {
    reportName: `${name} Report`,
    author: "",
    dataSources: ["./data/sample.csv"],
    fields: {
      custom: [
        {
          name: "report_date",
          // The split("T") here will return an array, which might be incorrect for a single value.
          // Assuming the intent was to get the date part.
          value: new Date().toISOString().split("T")[0],
        },
      ],
      computed: [
        { name: "total_revenue", function: "SUM(revenue)" },
        { name: "avg_revenue", function: "AVG(revenue)" },
      ],
    },
    specFile: "./spec.yml",
    output: {
      formats: ["md", "html", "pdf"],
      destination: "./output",
    },
  };

  writeFileSync(
    join(projectDir, "llm-framework.config.json"),
    JSON.stringify(config, null, 2)
  );

  // Spec
  const spec = {
    id: `${name}-report`,
    templateFile: "./templates/report.njk",
    variables: [
      {
        name: "summary",
        type: "markdown",
        promptFile: "./prompts/summary.md",
        inputs: ["bundle.samples.main", "bundle.computedFields"],
      },
    ],
  };

  writeFileSync(join(projectDir, "spec.yml"), YAML.stringify(spec));

  // Prompt
  const promptContent = [
    "# Report Summary",
    "",
    "Analyze the following data and provide a concise 2-paragraph summary.",
    "",
    "## Sample Data",
    "{% for record in main %}",
    "- {{record.date}}: {{record.product}} (${{record.revenue}})",
    "{% endfor %}",
    "",
    "## Computed Metrics",
    "- Total Revenue: ${{total_revenue}}",
    "- Average Revenue: ${{avg_revenue | round(2)}}",
    "",
    "## Instructions",
    "Write a professional summary highlighting:",
    "1. Overall performance",
    "2. Key trends",
    "3. Notable patterns",
    "",
    "Output only the summary text in markdown format.",
  ].join("\n");

  writeFileSync(join(projectDir, "prompts", "summary.md"), promptContent);

  // Template
  const templateContent = [
    "# {{reportName}}",
    "",
    "**Date:** {{customFields.report_date}}",
    "",
    "---",
    "",
    "## Summary",
    "",
    "{{summary}}",
    "",
    "---",
    "",
    "## Key Metrics",
    "",
    "| Metric | Value |",
    "|--------|-------|",
    "| Total Revenue | ${{computedFields.total_revenue}} |",
    "| Average Revenue | ${{computedFields.avg_revenue}} |",
    "| Total Records | {{stats.rowCount}} |",
    "",
    "---",
    "",
    "*Generated with LLM Data Framework*",
  ].join("\n");

  writeFileSync(join(projectDir, "templates", "report.njk"), templateContent);

  // Sample data
  const sampleData = [
    "date,product,revenue,region",
    "2025-01-01,Widget A,1500,US-WEST",
    "2025-01-02,Gadget B,2300,US-EAST",
    "2025-01-03,Widget A,1800,EMEA",
    "2025-01-04,Tool C,950,US-WEST",
    "2025-01-05,Gadget B,2100,APAC",
  ].join("\n");

  writeFileSync(join(projectDir, "data", "sample.csv"), sampleData);
}

function createSalesProject(projectDir: string, name: string) {
  // Config
  const config = {
    reportName: `${name} Sales Report`,
    author: "",
    dataSources: ["./data/sample-sales.csv"],
    fields: {
      custom: [
        { name: "company", value: "Your Company" },
        { name: "period", value: "Q1 2025" },
      ],
      computed: [
        { name: "total_revenue", function: "SUM(revenue)" },
        { name: "avg_revenue", function: "AVG(revenue)" },
        { name: "top_product", function: "TOP(product, revenue, 1)" },
      ],
    },
    specFile: "./spec.yml",
    output: {
      formats: ["md", "html", "pdf"],
      destination: "./output",
    },
  };

  writeFileSync(
    join(projectDir, "llm-framework.config.json"),
    JSON.stringify(config, null, 2)
  );

  // Spec
  const spec = {
    id: "sales-performance-report",
    templateFile: "./templates/sales-report.njk",
    variables: [
      {
        name: "executive_summary",
        type: "markdown",
        promptFile: "./prompts/executive-summary.md",
        inputs: [
          "bundle.samples.main",
          "bundle.computedFields.total_revenue",
          "bundle.computedFields.avg_revenue",
          "bundle.computedFields.top_product",
          "bundle.stats",
        ],
      },
    ],
  };

  writeFileSync(join(projectDir, "spec.yml"), YAML.stringify(spec));

  // Prompt
  const promptContent = [
    "# Executive Summary Generation",
    "",
    "You are a senior business analyst. Write a concise executive summary of sales performance.",
    "",
    "## Performance Metrics",
    "- Total Revenue: ${{total_revenue}}",
    "- Average Deal Size: ${{avg_revenue | round(2)}}",
    "- Top Product: {{top_product}}",
    "- Total Transactions: {{rowCount}}",
    "",
    "## Sample Recent Transactions",
    "{% for record in main %}",
    "- {{record.date}}: {{record.product}} - ${{record.revenue}} ({{record.region}})",
    "{% endfor %}",
    "",
    "## Instructions",
    "Write a professional 2-paragraph executive summary that:",
    "1. Opens with overall performance assessment",
    "2. Highlights the most significant trends",
    "3. Mentions top-performing product",
    "4. Ends with forward-looking statement",
    "",
    "Output in markdown format only, 150-200 words.",
  ].join("\n");

  writeFileSync(
    join(projectDir, "prompts", "executive-summary.md"),
    promptContent
  );

  // Template
  const templateContent = [
    "# 📈 {{reportName}}", // Corrected emoji
    "",
    "**Company:** {{customFields.company}}  ",
    "**Period:** {{customFields.period}}  ",
    "**Generated:** {{metadata.ingested_at}}",
    "",
    "---",
    "",
    "## 🎯 Executive Summary", // Corrected emoji
    "",
    "{{executive_summary}}",
    "",
    "---",
    "",
    "## 📊 Key Performance Indicators", // Corrected emoji
    "",
    "| Metric | Value |",
    "|--------|-------|",
    "| 💰 **Total Revenue** | ${{computedFields.total_revenue}} |", // Corrected emoji
    "| 🏆 **Top Product** | {{computedFields.top_product}} |", // Corrected emoji
    "| 💲 **Avg Deal Size** | ${{computedFields.avg_revenue}} |", // Corrected emoji
    "| 📦 **Total Orders** | {{stats.rowCount}} |", // Corrected emoji
    "",
    "---",
    "",
    "## 📘 Data Overview", // Corrected emoji
    "",
    "- **Source:** {{metadata.source_file}}",
    "- **Records Analyzed:** {{metadata.record_count}}",
    "- **Columns:** {{stats.columnCount}}",
    "",
    "---",
    "",
    "*Report generated with LLM Data Framework*",
  ].join("\n");

  writeFileSync(
    join(projectDir, "templates", "sales-report.njk"),
    templateContent
  );

  // Sample sales data
  const salesData = [
    "date,product,revenue,region,sales_rep",
    "2025-01-15,Enterprise Widget Pro,15000,US-WEST,Alice Johnson",
    "2025-01-16,Standard Widget,3200,US-EAST,Bob Smith",
    "2025-01-17,Enterprise Widget Pro,18000,EMEA,Carol Davis",
    "2025-01-18,Premium Gadget Plus,7500,US-WEST,Alice Johnson",
    "2025-01-19,Standard Widget,2800,APAC,David Lee",
    "2025-01-22,Enterprise Widget Pro,22000,US-EAST,Bob Smith",
    "2025-01-23,Premium Gadget Plus,8200,EMEA,Carol Davis",
    "2025-01-24,Standard Widget,3100,US-WEST,Alice Johnson",
  ].join("\n");

  writeFileSync(join(projectDir, "data", "sample-sales.csv"), salesData);
}
