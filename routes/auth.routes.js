import { Router } from "express";
import {
  signUp,
  signUpCandidate,
  createSession,
} from "../controllers/auth.controller.js";

const router = Router();
router.post("/signupcandidate", signUpCandidate);
router.post("/signup", signUp);
router.post("/signin", createSession);

export default router;
