import { Router } from "express";

import {
    graph,
    stats,
    node,
    relations,
    incoming,
    search
} from "./graph.controller.js";

const router = Router();

router.get("/", graph);

router.get("/stats", stats);

router.get("/node/:id", node);

router.get("/node/:id/relations", relations);

router.get("/node/:id/incoming", incoming);

router.get("/search/:label", search);

export default router;