import { Router } from "express";
import {
  signOut,
  getUser,
  getCurrentUserInvites,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/invites", getCurrentUserInvites);
router.post("/signout", signOut);
router.get("/:id", getUser);

export default router;
  