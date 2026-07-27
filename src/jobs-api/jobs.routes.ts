import { Router } from "express";

import { getJobHistory } from "./jobs.controller.js";

const router = Router();

router.get("/history", getJobHistory);

export default router;
