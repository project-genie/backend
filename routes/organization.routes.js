import { Router } from "express";
import {
  createOrganization,
  deleteOrganization,
  updateOrganization,
} from "../controllers/organization.controller.js";

const router = Router();

router.post("/", createOrganization);
router.delete("/", deleteOrganization);
router.put("/", updateOrganization);

export default router;
