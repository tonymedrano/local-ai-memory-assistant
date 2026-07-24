import fs from "node:fs/promises";
import path from "node:path";

import { type ProjectContext } from "./project.types.js";

const PROJECT_FILE = path.join(process.cwd(), "data/projects.json");

export class ProjectRegistry {
  async getProjects(): Promise<ProjectContext[]> {
    try {
      const data = await fs.readFile(PROJECT_FILE, "utf8");

      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async getProject(id: string): Promise<ProjectContext | undefined> {
    const projects = await this.getProjects();

    return projects.find((p) => p.id === id);
  }

  async registerProject(project: ProjectContext) {
    const projects = await this.getProjects();

    const exists = projects.some((p) => p.id === project.id);

    if (!exists) {
      projects.push(project);
console.log(
  "Registrando proyecto:",
  project
);
      await fs.writeFile(PROJECT_FILE, JSON.stringify(projects, null, 2));
    }
  }

  async findByPath(rootPath: string): Promise<ProjectContext | undefined> {
    const projects = await this.getProjects();

    return projects.find((project) => project.rootPath === rootPath);
  }
}
