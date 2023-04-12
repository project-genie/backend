import { Router } from "express";
import {
  signOut,
  getUser,
  getCurrentUserInvites,
  getCurrentUser,
  updateUser,
} from "../controllers/user.controller.js";

const router = Router();
router.get("/me", getCurrentUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);

router.get("/invites", getCurrentUserInvites);
router.post("/signout", signOut);

export default router;
