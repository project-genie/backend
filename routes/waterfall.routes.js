import { Router } from "express";
import {
  createWaterfallRequirement,
  updateWaterfall,
} from "../controllers/waterfall.controller.js";

const router = Router();

router.put("/update/:id", updateWaterfall); // Update a waterfall."

router.post("/requirements/create/:id", createWaterfallRequirement);

export default router;
