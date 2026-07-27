import type { Request, Response } from "express";

import { jobRepository } from "../jobs-history/job.repository.instance.js";

export async function getJobHistory(req: Request, res: Response) {
  const jobs = await jobRepository.getAll();

  res.json(jobs);
}
