import { Router } from "express";
import { signOut, getUser } from "../controllers/user.controller.js";

const router = Router();
router.post("/signout", signOut);
router.get("/:id", getUser);

export default router;
