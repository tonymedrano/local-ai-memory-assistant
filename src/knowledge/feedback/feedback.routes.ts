import { Router } from "express";

import { getFeedback, getFeedbackByKnowledge } from "./feedback.controller.js";

const router = Router();

router.get("/", getFeedback);

router.get("/:id", getFeedbackByKnowledge);

export default router;
