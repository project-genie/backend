import { Router } from "express";
import {
  signOut,
  getUser,
  getCurrentUserInvites,
} from "../controllers/user.controller.js";

const router = Router();
router.post("/signout", signOut);
router.get("/invites", getCurrentUserInvites);
router.get("/:id", getUser);

export default router;
