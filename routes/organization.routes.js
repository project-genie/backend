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
} from "../controllers/organization.controller.js";

const router = Router();

// CRUD
router.post("/", createOrganization);
router.delete("/:id", deleteOrganization);
router.post("/:id/leave", leaveOrganization);
router.put("/:id", updateOrganization);

router.get("/:id/members", getOrganizationMembers); // Get all members of an organization.
router.get("/:id", getOrganization);

// Other routes
router.get("/", getOrganizations); // Get all organizations of the current user.

router.get("/invites/:id", getOrganizationInvites); // Get all invites.
router.post("/invites/:id", removeInvitation); // Remove an invitation

router.post("/invite/accept", acceptInvitation); // Accept an invitation to an organization.
router.post("/invite/reject", rejectInvitation); // Reject an invitation to an organization.
// Invite operations
router.post("/invite/:id", inviteUserToOrganization); // Invite a user to an organization.

router.delete("/:id/members/:userId", removeOrganizationMember); // Remove a member from a project.
router.put("/:id/members", updateOrganizationMember); //  Update a member of a project.

router.get("/currentuserorganization/:id", getCurrentUserOrganization);

export default router;
