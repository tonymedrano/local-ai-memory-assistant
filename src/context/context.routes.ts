import { Router } from "express";

import { context } from "./context.controller.js";

const router = Router();

router.post("/context", context);

export default router;
