import { test } from "node:test";
import assert from "node:assert";
import { UniversalConnector } from "../../dist/connectors/universal-connector.js";

test("CSV Connector loads data", () => {
  const records = UniversalConnector.load("tests/fixtures/sample-sales.csv");
  assert.equal(records.length, 5);
  assert.equal(records[0].product, "Widget A");
});

test("JSON Connector loads data", () => {
  const records = UniversalConnector.load("tests/fixtures/sample-sales.json");
  assert.equal(records.length, 2);
  assert.equal(records[0].product, "Widget A");
});
