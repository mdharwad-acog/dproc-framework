import { Command } from "commander";
import inquirer from "inquirer";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import * as YAML from "yaml";

export const initCommand = new Command("init")
  .description("Initialize a new report project")
  .argument("[name]", "Project name", "my-report")
  .option("-t, --template <type>", "Template type (sales|generic)")
  .option(
    "-d, --dir <directory>",
    "Custom directory (default: current directory)"
  )
  .action(
    async (name: string, options: { template?: string; dir?: string }) => {
      console.log(chalk.blue(`\n🚀 Initializing project: ${name}\n`));

      // Create in current directory or specified directory
      const baseDir = options.dir || process.cwd();
      const projectDir = join(baseDir, name);

      if (existsSync(projectDir)) {
        console.error(chalk.red(`❌ Directory ${name} already exists`));
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
                name: "📊 Sales Performance Report - Revenue, growth, product analysis",
                value: "sales",
              },
              {
                name: "📝 Generic Report - Start from scratch",
                value: "generic",
              },
            ],
          },
        ]);
        templateType = answer.template;
      }

      // Create directory structure
      mkdirSync(projectDir, { recursive: true });
      mkdirSync(join(projectDir, "data"), { recursive: true });
      mkdirSync(join(projectDir, "prompts"), { recursive: true });
      mkdirSync(join(projectDir, "templates"), { recursive: true });
      mkdirSync(join(projectDir, "output"), { recursive: true });

      if (templateType === "sales") {
        createSalesProject(projectDir, name);
      } else {
        createGenericProject(projectDir, name);
      }

      // Create README
      const readme = [
        "cd " + name,
        "llm-framework generate",
        "```",
        "",
        "## Files",
        "",
        "- `llm-framework.config.json` - Project configuration",
        "- `spec.yml` - Report structure definition",
        "- `data/` - Your datasets",
        "- `prompts/` - LLM prompt templates",
        "- `templates/` - Report layout templates",
        "- `output/` - Generated reports",
        "",
        "## Configuration",
        "",
        "Configure API keys once (stored globally):",
        "```bash",
        "llm-framework setup",
        "```",
      ].join("\n");

      writeFileSync(join(projectDir, "README.md"), readme);

      console.log(chalk.green(`✅ Project created: ${projectDir}\n`));
      console.log(chalk.blue("➡️ Next steps:"));
      console.log(`  cd ${name}`);
      console.log(`  llm-framework generate       # Generate report\n`);
    }
  );

function createGenericProject(projectDir: string, name: string) {
  const config = {
    reportName: `${name} Report`,
    author: "",
    dataSources: ["./data/sample.csv"],
    fields: {
      custom: [
        {
          name: "report_date",
          value: new Date().toISOString().split("T"),
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

  const templateContent = [
    "# 📊 {{reportName}}",
    "",
    "**Company:** {{customFields.company}}  ",
    "**Period:** {{customFields.period}}  ",
    "**Generated:** {{metadata.ingested_at}}",
    "",
    "---",
    "",
    "## 🎯 Executive Summary",
    "",
    "{{executive_summary}}",
    "",
    "---",
    "",
    "## 📈 Key Performance Indicators",
    "",
    "| Metric | Value |",
    "|--------|-------|",
    "| 💰 **Total Revenue** | ${{computedFields.total_revenue}} |",
    "| 🏆 **Top Product** | {{computedFields.top_product}} |",
    "| 💵 **Avg Deal Size** | ${{computedFields.avg_revenue}} |",
    "| 📦 **Total Orders** | {{stats.rowCount}} |",
    "",
    "---",
    "",
    "## 📊 Data Overview",
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
