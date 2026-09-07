import path from "node:path";

import { config } from "../config.js";
import { readJsonFile, writeJsonFileAtomic } from "../persistence/json.file.js";

export interface ProjectRegistry {
  id: string;

  name: string;

  rootPath: string;

  collection: string;

  lastIndexed: string;

  files: number;
}

const REGISTRY_PATH = path.join(config.dataDir, "registry", "projects.json");

async function loadRegistry() {
  return readJsonFile(REGISTRY_PATH, { projects: [] as ProjectRegistry[] });
}

async function saveRegistry(data: { projects: ProjectRegistry[] }) {
  await writeJsonFileAtomic(REGISTRY_PATH, data);
}

export async function registerProject(project: ProjectRegistry) {
  const registry = await loadRegistry();

  const index = registry.projects.findIndex((p) => p.id === project.id);

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
