import { Router } from "express";

import {
  getInference,
  getExplanation,
  getConflicts,
} from "./inference.controller.js";

const router = Router();

router.get("/conflicts", getConflicts);

router.get("/explain/:subject/:relation/:object", getExplanation);

router.get("/", getInference);

router.get("/:subject", getInference);

export default router;
