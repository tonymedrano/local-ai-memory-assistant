import path from "node:path";

import { ProjectRegistry } from "./project.registry.js";

import { type ProjectContext } from "./project.types.js";

export class ProjectResolver {
  constructor(private registry: ProjectRegistry) {}

  async resolve(folder: string): Promise<ProjectContext> {
    const rootPath = path.resolve(folder);

    const existing = await this.registry.findByPath(rootPath);

    if (existing) {
      return existing;
    }

    const id = path
      .basename(rootPath)
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();

    const project: ProjectContext = {
      id,

      name: id,

      rootPath,

      collection: `project_${id}`,

      createdAt: new Date().toISOString(),
    };

    await this.registry.registerProject(project);

    return project;
  }
}
