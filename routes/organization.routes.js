import { Router } from "express";
import {
  createOrganization,
  deleteOrganization,
  updateOrganization,
  getOrganization,
  getOrganizations,
  getOrganizationMembers,
  inviteUserToOrganization,
  acceptInvitation,
  rejectInvitation,
  removeOrganizationMember,
  updateOrganizationMember,
  getCurrentUserOrganization,
  getOrganizationInvites,
  removeInvitation,
  leaveOrganization,
  getNumberOfTasksProjects,
} from "../controllers/organization.controller.js";

const router = Router();

router.get("/", getOrganizations); // Get all organizations of the current user.
router.post("/", createOrganization); // Create a new organization.

router.get("/:id/members", getOrganizationMembers); // Get all members of an organization.
router.post("/:id/leave", leaveOrganization); // Leave an organization.

router.get("/projects/tasks/:id", getNumberOfTasksProjects);

router.get("/:id", getOrganization); // Get an organization.
router.delete("/:id", deleteOrganization); // Delete an organization.
router.put("/:id", updateOrganization); // Update an organization.

// Invite operations
router.post("/invite/accept", acceptInvitation); // Accept an invitation to an organization.
router.post("/invite/reject", rejectInvitation); // Reject an invitation to an organization.,
router.post("/invite/:id", inviteUserToOrganization); // Invite a user to an organization.
router.get("/invites/:id", getOrganizationInvites); // Get all invites.
router.post("/invites/:id", removeInvitation); // Remove an invitation

// Member operations
router.put("/:id/members", updateOrganizationMember); //  Update a member of a project.
router.delete("/:id/members/:userId", removeOrganizationMember); // Remove a member from a project.

router.get("/currentuserorganization/:id", getCurrentUserOrganization);

export default router;
