import { Router } from "express";
import { signOut } from "../controllers/user.controller.js";

const router = Router();
router.post("/signout", signOut);

export default router;
