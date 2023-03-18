import { Router } from "express";
import {
  createOrganization,
  deleteOrganization,
  updateOrganization,
  getOrganizations,
  getOrganizationMembers,
} from "../controllers/organization.controller.js";

const router = Router();

// CRUD
router.post("/", createOrganization);
router.delete("/:id", deleteOrganization);
router.put("/:id", updateOrganization);

// Other routes
router.get("/", getOrganizations); // Get all organizations of the current user.
router.get("/:id/members", getOrganizationMembers); // Get all members of an organization.

export default router;
