#!/usr/bin/env node

/**
 * dproc - LLM-Powered Data Processing Framework
 * https://github.com/mdharwad/dproc-framework
 */

import("../dist/cli/index.js").catch((error) => {
  console.error("❌ Failed to load dproc CLI:");
  console.error(error.message);
  console.error("\nTry running: pnpm install");
  process.exit(1);
});
