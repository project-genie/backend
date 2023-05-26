import { Router } from "express";
import {
  createSprint,
  createSprintRequirement,
  deleteSprint,
  deleteSprintRequirement,
  endSprint,
  getSprint,
  getSprintRequirements,
  getSprints,
  startSprint,
  updateSprint,
  updateSprintRequirement,
} from "../controllers/sprint.controller.js";

const router = Router();

router.get("/sprint/:id", getSprint); // Get all sprints of a project.
router.get("/:id", getSprints); // Get all sprints of a project.
router.post("/:id", createSprint); // Create a new sprint.
router.delete("/delete/:id", deleteSprint); // Delete a sprint.
router.put("/update/:id", updateSprint); // Update a sprint.
router.post("/end/:id", endSprint); // End a sprint.

router.get("/requirements/:id", getSprintRequirements); // Get all sprint requirements of a sprint.
router.post("/requirements/create/:id", createSprintRequirement); // Create a new sprint requirement.
router.delete("/requirements/delete/:id", deleteSprintRequirement); // Delete a sprint requirement.
router.put("/requirements/update/:id", updateSprintRequirement); // Update a sprint requirement.

export default router;
