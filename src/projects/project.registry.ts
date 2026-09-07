import path from "node:path";

import { config } from "../config.js";
import { readJsonFile, writeJsonFileAtomic } from "../persistence/json.file.js";
import { type ProjectContext } from "./project.types.js";

const PROJECT_FILE = path.join(config.dataDir, "projects.json");

export class ProjectRegistry {
  async getProjects(): Promise<ProjectContext[]> {
    return readJsonFile(PROJECT_FILE, []);
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
      await writeJsonFileAtomic(PROJECT_FILE, projects);
    }
  }

  async findByPath(rootPath: string): Promise<ProjectContext | undefined> {
    const projects = await this.getProjects();

    return projects.find((project) => project.rootPath === rootPath);
  }
}
