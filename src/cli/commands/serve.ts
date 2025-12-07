import { Command } from "commander";
import chalk from "chalk";
import { exec } from "child_process";
import { networkInterfaces } from "os";
import { createServer } from "../../server/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const serveCommand = new Command("serve")
  .description("Start LLM Framework Studio (Web UI)")
  .option("-p, --port <port>", "Port number", "5555")
  .option("--no-open", "Don't open browser automatically")
  .action(async (options) => {
    console.log(chalk.blue("\n🚀 Starting LLM Framework Studio...\n"));

    try {
      const projectDir = process.env.PROJECT_DIR || `../${dirname}`;
      const app = createServer(projectDir);

      const server = app.listen(options.port, "0.0.0.0", () => {
        console.log(chalk.green("✅ LLM Framework Studio is running!\n"));

        const localUrl = `http://localhost:${options.port}`;
        console.log(chalk.blue(`   Local:    ${localUrl}`));

        const networkUrls = getNetworkUrls(options.port);
        if (networkUrls.length > 0) {
          networkUrls.forEach((url) => {
            console.log(chalk.blue(`   Network:  ${url}`));
          });
        }

        console.log(chalk.blue(`   Projects: ${projectDir}`));
        console.log(chalk.gray("\n   Press Ctrl+C to stop\n"));

        if (options.open) {
          setTimeout(() => {
            openBrowser(localUrl);
          }, 1000);
        }
      });

      const shutdown = () => {
        console.log(chalk.yellow("\n\n👋 Shutting down Studio..."));
        server.close(() => {
          console.log(chalk.gray("Studio stopped.\n"));
          process.exit(0);
        });
      };

      process.on("SIGTERM", shutdown);
      process.on("SIGINT", shutdown);
    } catch (error: any) {
      console.error(
        chalk.red(`\n❌ Failed to start Studio: ${error.message}\n`)
      );
      process.exit(1);
    }
  });

function getNetworkUrls(port: string): string[] {
  const urls: string[] = [];
  const interfaces = networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const netInterface = interfaces[name];
    if (!netInterface) continue;

    for (const net of netInterface) {
      if (net.family === "IPv4" && !net.internal) {
        urls.push(`http://${net.address}:${port}`);
      }
    }
  }

  return urls;
}

function openBrowser(url: string) {
  const platform = process.platform;
  let command: string;

  if (platform === "darwin") {
    command = `open "${url}"`;
  } else if (platform === "win32") {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}" 2>/dev/null || true`;
  }

  exec(command);
}
