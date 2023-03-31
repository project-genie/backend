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
  getPotentialMembers,
  getProject,
} from "../controllers/project.controller.js";

const router = Router();

router.get("/", getProjectsCurrentUser); // Get all projects of the current user.
router.post("/", createProject); // Create a new project.

router.get("/:id/members", getProjectMembers); // Get all members of a project.
router.put("/:id/members", updateProjectMember); // Update a member of a project.
router.post("/:id/members", addProjectMember); // Add a member to a project.
router.post("/:id/members/remove", removeProjectMember); // Remove a member from a project.

router.get("/:id/nonmembers", getPotentialMembers); // Get all members of a project.

router.get("/:id", getProject); // Get a project.
router.delete("/:id", deleteProject); // Delete a project.
router.put("/:id", updateProject); // Update a project.

router.get("/organization/currentuser/:id", getProjectsOrganizationCurrentUser); // Get all projects of the current user in an organization.
router.get("/organization/:id", getProjectsOrganization); // Get all projects of an organization.

router.get("/currentuserproject/:id", getCurrentUserProject); // Get the current user in the project. (For role checking.)

export default router;
