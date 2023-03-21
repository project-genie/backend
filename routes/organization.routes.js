import { Router } from "express";
import {
  createOrganization,
  deleteOrganization,
  updateOrganization,
  getOrganizations,
  getOrganizationMembers,
  inviteUserToOrganization,
  acceptInvitation,
  rejectInvitation,
  removeOrganizationMember,
  updateOrganizationMember,
} from "../controllers/organization.controller.js";

const router = Router();

// CRUD
router.post("/", createOrganization);
router.delete("/:id", deleteOrganization);
router.put("/:id", updateOrganization);

// Other routes
router.get("/", getOrganizations); // Get all organizations of the current user.
router.get("/:id/members", getOrganizationMembers); // Get all members of an organization.

router.post("/invite/accept", acceptInvitation); // Accept an invitation to an organization.
router.post("/invite/reject", rejectInvitation); // Reject an invitation to an organization.
// Invite operations
router.post("/invite/:id", inviteUserToOrganization); // Invite a user to an organization.

router.delete("/:id/members", removeOrganizationMember); // Add a member to a project."
router.put("/:id/members", updateOrganizationMember); // Remove a member from a project.

export default router;
