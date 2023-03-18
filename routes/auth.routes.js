import { Router } from "express";
import {
  signUp,
  createSession,
  deleteSession,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", createSession);
router.post("/signout", deleteSession);

export default router;
