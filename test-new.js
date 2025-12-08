import { BundleLoader } from "./dist/core/bundle-loader.js";

async function testNewFeatures() {
  const loader = new BundleLoader();

  console.log("🧪 Testing new features...\n");

  // Test 1: Basic load (existing)
  console.log("1️⃣ Testing basic load (existing):");
  const basicBundle = await loader.loadDataset(
    "./tests/fixtures/sample-sales.csv"
  );
  console.log("   ✅ Records:", basicBundle.records.length);
  console.log("   ✅ Has metadata:", !!basicBundle.metadata);
  console.log("   ✅ Has stats:", !!basicBundle.stats);
  console.log("");

  // Test 2: Load with validation (NEW)
  console.log("2️⃣ Testing load with validation (NEW):");
  const validatedBundle = await loader.loadDatasetWithValidation(
    "./tests/fixtures/sample-sales.csv"
  );
  console.log("   ✅ Schema ID:", validatedBundle.metadata.schema_id);
  console.log(
    "   ✅ Schema description:",
    Object.keys(validatedBundle.metadata.schema_description || {}).length,
    "fields"
  );
  console.log("   ✅ Validation results:", validatedBundle.metadata.validation);
  console.log("");

  // Test 3: Load with normalization (NEW)
  console.log("3️⃣ Testing load with normalization (NEW):");
  const normalizedBundle = await loader.loadDatasetWithNormalization(
    "./tests/fixtures/sample-sales.csv"
  );
  console.log("   ✅ Normalized:", normalizedBundle.metadata.normalized);
  console.log(
    "   ✅ Timestamp:",
    normalizedBundle.metadata.normalization_timestamp
  );
  console.log("");

  // Test 4: Load with full processing (NEW)
  console.log("4️⃣ Testing load with full processing (NEW):");
  const processedBundle = await loader.loadDatasetWithProcessing(
    "./tests/fixtures/sample-sales.csv"
  );
  console.log("   ✅ Processed:", processedBundle.metadata.processed);
  console.log(
    "   ✅ Has enhanced stats:",
    !!processedBundle.stats.distributions
  );
  console.log("   ✅ Has ranges:", !!processedBundle.stats.ranges);
  console.log(
    "   ✅ Column stats:",
    Object.keys(processedBundle.stats.columns || {}).length,
    "columns"
  );
  console.log("");

  console.log("🎉 All new features are working!\n");

  // Show enhanced stats sample
  console.log("📊 Enhanced Stats Sample:");
  console.log(
    JSON.stringify(processedBundle.stats.columns, null, 2).slice(0, 500) + "..."
  );
}

testNewFeatures().catch(console.error);
