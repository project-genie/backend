import { Router } from "express";
import {
  createProject,
  deleteProject,
  updateProject,
  getProjectsCurrentUser,
  getProjectMembers,
  getProjectsOrganization,
  addProjectMember,
  removeProjectMember,
  updateProjectMember,
  getCurrentUserProject,
  getProjectsOrganizationCurrentUser,
} from "../controllers/project.controller.js";

const router = Router();

// CRUD
router.post("/", createProject);
router.delete("/:id", deleteProject);
router.put("/:id", updateProject);

// Other routes
router.get("/", getProjectsCurrentUser); // Get all projects of the current user.
router.get("/organization/currentuser/:id", getProjectsOrganizationCurrentUser); // Get all projects of the current user in an organization.
router.get("/organization/:id", getProjectsOrganization); // Get all projects of an organization.
router.get("/:id/members", getProjectMembers); // Get all members of a project.

router.post("/:id/members", addProjectMember); // Add a member to a project.
router.delete("/:id/members", removeProjectMember); // Remove a member from a project.
router.put("/:id/members", updateProjectMember); // Update a member of a project.

router.get("/currentuserproject/:id", getCurrentUserProject);

export default router;
