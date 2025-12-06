import { test } from "node:test";
import assert from "node:assert";
import { BundleLoader } from "../../dist/core/bundle-loader.js";
import { ReportEngine } from "../../dist/core/report-engine.js";
import { existsSync, mkdirSync } from "fs";

// Mock LLM Client
class MockLLMClient {
  async generateText() {
    return "This is a test summary of sales data showing positive growth trends.";
  }
}

test("Report engine generates report", async () => {
  // Setup
  const loader = new BundleLoader();
  const bundle = await loader.loadDataset("tests/fixtures/sample-sales.csv");
  const enriched = loader.enrichBundle(
    bundle,
    [],
    [
      { name: "total_revenue", function: "SUM(revenue)" },
      { name: "avg_revenue", function: "AVG(revenue)" },
    ]
  );

  const mockClient = new MockLLMClient();
  const engine = new ReportEngine(mockClient);

  const config = {
    reportName: "Test Report",
    author: "Test Author",
    dataSources: ["tests/fixtures/sample-sales.csv"],
    spec: {
      variables: [
        {
          name: "summary",
          type: "markdown",
          prompt: "tests/fixtures/prompts/summary.md",
          inputs: [
            "bundle.samples.main",
            "bundle.computedFields.total_revenue",
          ],
        },
      ],
    },
    template: "tests/fixtures/templates/report.njk",
    output: {
      formats: ["md"],
      destination: "./tests/output",
    },
  };

  // Ensure output directory exists
  if (!existsSync("./tests/output")) {
    mkdirSync("./tests/output", { recursive: true });
  }

  // Execute
  const markdown = await engine.generate(config, enriched);

  // Verify
  assert.ok(markdown.includes("Test Report"));
  assert.ok(markdown.includes("test summary"));
  assert.ok(markdown.includes("8650"));
});
