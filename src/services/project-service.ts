import { readdir, readFile, mkdir, stat } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { existsSync } from "fs";
import { ProjectConfig, ProjectConfigSchema } from "../core/types.js";

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  config: ProjectConfig;
  lastModified: Date;
}

export class ProjectService {
  private static getProjectsDir(): string {
    // Use environment variable or default to ~/.llm-framework/projects
    return (
      process.env.PROJECT_DIR ||
      join(homedir(), ".aganitha", ".llm-framework", "projects")
    );
  }

  static async listProjects(): Promise<ProjectInfo[]> {
    const projectsDir = this.getProjectsDir();

    if (!existsSync(projectsDir)) {
      await mkdir(projectsDir, { recursive: true });
      return [];
    }

    const entries = await readdir(projectsDir);
    const projects: ProjectInfo[] = [];

    for (const entry of entries) {
      const projectPath = join(projectsDir, entry);
      const configPath = join(projectPath, "dproc.config.json");

      if (existsSync(configPath)) {
        try {
          const configContent = await readFile(configPath, "utf-8");
          const config = JSON.parse(configContent);
          const stats = await stat(configPath);

          projects.push({
            id: entry,
            name: config.reportName || entry,
            path: projectPath,
            config: ProjectConfigSchema.parse(config),
            lastModified: stats.mtime,
          });
        } catch (error) {
          console.error(`Failed to load project ${entry}:`, error);
        }
      }
    }

    return projects.sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime()
    );
  }

  static async getProject(id: string): Promise<ProjectInfo | null> {
    const projectPath = join(this.getProjectsDir(), id);
    const configPath = join(projectPath, "dproc.config.json");

    if (!existsSync(configPath)) {
      return null;
    }

    try {
      const configContent = await readFile(configPath, "utf-8");
      const config = JSON.parse(configContent);
      const stats = await stat(configPath);

      return {
        id,
        name: config.reportName || id,
        path: projectPath,
        config: ProjectConfigSchema.parse(config),
        lastModified: stats.mtime,
      };
    } catch (error) {
      console.error(`Failed to load project ${id}:`, error);
      return null;
    }
  }
}
