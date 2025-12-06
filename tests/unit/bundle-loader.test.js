import { test } from "node:test";
import assert from "node:assert";
import { BundleLoader } from "../../dist/core/bundle-loader.js";

test("Bundle loader creates basic bundle", async () => {
  const loader = new BundleLoader();
  const bundle = await loader.loadDataset("tests/fixtures/sample-sales.csv");

  assert.equal(bundle.metadata.record_count, 5);
  assert.ok(bundle.stats.revenue);
  assert.equal(bundle.stats.revenue.type, "numeric");
  assert.equal(bundle.samples.main.length, 5);
});

test("Bundle enrichment with computed fields", async () => {
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

  assert.equal(enriched.computedFields.total_revenue, 8650);
  assert.ok(enriched.computedFields.avg_revenue > 1700);
});
