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
  getNumberOfTasksProject,
  createSprint,
  startSprint,
  updateSprint,
  endSprint,
  updateWaterfall,
  getSprints,
  getSprint,
  deleteSprint,
} from "../controllers/project.controller.js";

const router = Router();

router.get("/", getProjectsCurrentUser); // Get all projects of the current user.
router.post("/", createProject); // Create a new project.

router.get("/:id/members", getProjectMembers); // Get all members of a project.
router.put("/:id/members", updateProjectMember); // Update a member of a project.
router.post("/:id/members", addProjectMember); // Add a member to a project.
router.post("/:id/members/remove", removeProjectMember); // Remove a member from a project.

router.get("/:id/nonmembers", getPotentialMembers); // Get all members of a project.

router.get("/tasks/:id", getNumberOfTasksProject);

router.get("/:id", getProject); // Get a project.
router.delete("/:id", deleteProject); // Delete a project.
router.put("/:id", updateProject); // Update a project.

router.get("/organization/currentuser/:id", getProjectsOrganizationCurrentUser); // Get all projects of the current user in an organization.
router.get("/organization/:id", getProjectsOrganization); // Get all projects of an organization.

router.get("/currentuserproject/:id", getCurrentUserProject); // Get the current user in the project. (For role checking.)

router.get("/sprint/:id", getSprint); // Get all sprints of a project.
router.get("/sprints/:id", getSprints); // Get all sprints of a project.
router.post("/sprints/:id", createSprint); // Create a new sprint.
router.post("/sprints/start/:id", startSprint); // Start a new sprint.
router.delete("/sprints/delete/:id", deleteSprint); // Delete a sprint.
router.put("/sprints/update/:id", updateSprint); // Update a sprint.
router.post("/sprints/end/:id", endSprint); // End a sprint.
router.post("/waterfalls/update:id", updateWaterfall); // Update a waterfall.")

export default router;
