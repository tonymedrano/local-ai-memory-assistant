import { Router } from "express";

import {
  getResolutions,
  getResolutionBySubject,
} from "./resolution.controller.js";

const router = Router();

router.get("/", getResolutions);

router.get("/:subject", getResolutionBySubject);

export default router;
