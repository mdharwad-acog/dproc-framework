import express from "express";
import cors from "cors";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { readFile, readdir, stat } from "fs/promises";
import { fileURLToPath } from "url";
import { ProjectService } from "../services/project-service.js";
import { BundleLoader } from "../core/bundle-loader.js";
import { ReportEngine } from "../core/report-engine.js";
import { AiSdkLlmClient } from "../core/llm-client.js";
import { SecretsManager } from "../core/secrets-manager.js";
import { writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer(projectDir: string) {
  const app = express();
  console.log(projectDir);
  app.use(cors());
  app.use(express.json());

  // Serve static files (built Vite app)
  const webDistPath = join(__dirname, "../../web/dist");

  // API Routes first (before static files)

  // API: List projects
  app.get("/api/projects", async (req, res) => {
    try {
      process.env.PROJECT_DIR = projectDir;
      const projects = await ProjectService.listProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Get project details
  app.get("/api/projects/:id", async (req, res) => {
    try {
      process.env.PROJECT_DIR = projectDir;
      const project = await ProjectService.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Generate report
  app.post("/api/projects/:id/generate", async (req, res) => {
    try {
      process.env.PROJECT_DIR = projectDir;
      const project = await ProjectService.getProject(req.params.id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const originalCwd = process.cwd();
      process.chdir(project.path);

      try {
        const bundleLoader = new BundleLoader();
        const dataPath = project.config.dataSources[0];
        const basicBundle = await bundleLoader.loadDataset(dataPath);
        const bundle = bundleLoader.enrichBundle(
          basicBundle,
          project.config.fields?.custom,
          project.config.fields?.computed
        );

        const activeProvider = SecretsManager.getActiveProvider();
        const apiKey = SecretsManager.getKeyForProvider(activeProvider);
        const model =
          project.config.llm?.model || SecretsManager.getActiveModel();

        const llmClient = new AiSdkLlmClient(apiKey, activeProvider, model);
        const reportEngine = new ReportEngine(llmClient);
        await reportEngine.generate(project.config, bundle);

        res.json({
          success: true,
          message: "Report generated successfully",
        });
      } finally {
        process.chdir(originalCwd);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: List reports
  app.get("/api/projects/:id/reports", async (req, res) => {
    try {
      process.env.PROJECT_DIR = projectDir;
      const project = await ProjectService.getProject(req.params.id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const outputDir = join(project.path, project.config.output.destination);
      const reports = [];

      if (existsSync(outputDir)) {
        const files = await readdir(outputDir);

        for (const file of files) {
          const filePath = join(outputDir, file);
          const stats = await stat(filePath);

          if (stats.isFile()) {
            const ext = file.split(".").pop() || "";
            reports.push({
              name: file,
              size: stats.size,
              modified: stats.mtime,
              format: ext.toUpperCase(),
            });
          }
        }
      }

      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Download report
  app.get("/api/projects/:id/download", async (req, res) => {
    try {
      process.env.PROJECT_DIR = projectDir;
      const fileName = req.query.file as string;

      if (!fileName) {
        return res.status(400).json({ error: "Missing file parameter" });
      }

      const project = await ProjectService.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const filePath = join(
        project.path,
        project.config.output.destination,
        fileName
      );

      if (!existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const content = await readFile(filePath);
      const ext = fileName.split(".").pop()?.toLowerCase();

      let contentType = "application/octet-stream";
      if (ext === "md") contentType = "text/markdown";
      else if (ext === "html") contentType = "text/html";
      else if (ext === "pdf") contentType = "application/pdf";

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.send(content);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Get settings status
  app.get("/api/settings/status", async (req, res) => {
    try {
      const active = SecretsManager.getActiveProvider();

      const status = {
        gemini: false,
        openai: false,
        deepseek: false,
        active,
      };

      try {
        SecretsManager.getKeyForProvider("gemini");
        status.gemini = true;
      } catch {}
      try {
        SecretsManager.getKeyForProvider("openai");
        status.openai = true;
      } catch {}
      try {
        SecretsManager.getKeyForProvider("deepseek");
        status.deepseek = true;
      } catch {}

      res.json(status);
    } catch (error: any) {
      res.json({
        gemini: false,
        openai: false,
        deepseek: false,
        active: "gemini",
      });
    }
  });

  // API: Save settings
  app.post("/api/settings/save", async (req, res) => {
    try {
      const { keys, models, activeProvider } = req.body;

      const secretsDir = join(homedir(), ".llm-framework");
      if (!existsSync(secretsDir)) {
        mkdirSync(secretsDir, { recursive: true });
      }

      const secrets = {
        providers: {
          gemini: {
            apiKey: keys.gemini || "",
            default_model: models.gemini || "gemini-2.0-flash-exp",
          },
          openai: {
            apiKey: keys.openai || "",
            default_model: models.openai || "gpt-4o-mini",
          },
          deepseek: {
            apiKey: keys.deepseek || "",
            default_model: models.deepseek || "deepseek-chat",
          },
        },
        active_provider: activeProvider || "gemini",
      };

      const secretsPath = join(secretsDir, "secrets.json");
      writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Serve static files AFTER API routes
  if (existsSync(webDistPath)) {
    app.use(express.static(webDistPath));

    // SPA fallback - serve index.html for all non-API routes
    app.use((req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(join(webDistPath, "index.html"));
      } else {
        res.status(404).json({ error: "Not found" });
      }
    });
  } else {
    app.use((req, res) => {
      res.status(404).send("Web UI not built. Run: pnpm build:web");
    });
  }

  return app;
}
