import fs from "node:fs/promises";
import path from "node:path";

export interface ProjectRegistry {
  id: string;

  name: string;

  rootPath: string;

  collection: string;

  lastIndexed: string;

  files: number;
}

const REGISTRY_PATH = path.resolve(
  process.cwd(),
  "data/registry/projects.json",
);

async function loadRegistry() {
  try {
    const data = await fs.readFile(REGISTRY_PATH, "utf-8");

    return JSON.parse(data);
  } catch {
    return {
      projects: [],
    };
  }
}

async function saveRegistry(data: any) {
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(data, null, 2));
}

export async function registerProject(project: ProjectRegistry) {
  const registry = await loadRegistry();

  const index = registry.projects.findIndex((p: any) => p.id === project.id);

  if (index >= 0) {
    registry.projects[index] = project;
  } else {
    registry.projects.push(project);
  }

  await saveRegistry(registry);
}

export async function getProject(id: string) {
  const registry = await loadRegistry();

  return registry.projects.find((p: any) => p.id === id);
}

export async function listProjects() {
  const registry = await loadRegistry();

  return registry.projects;
}
