import { Router } from "express";
import {
  createProject,
  deleteProject,
  updateProject,
  getProjectsCurrentUser,
  getProjectMembers,
  getProjectsOrganization,
} from "../controllers/project.controller.js";

const router = Router();

// CRUD
router.post("/", createProject);
router.delete("/:id", deleteProject);
router.put("/:id", updateProject);

// Other routes
router.get("/", getProjectsCurrentUser); // Get all projects of the current user.
router.get("/organization/:id", getProjectsOrganization); // Get all projects of an organization.
router.get("/:id/members", getProjectMembers); // Get all members of a project.

export default router;
