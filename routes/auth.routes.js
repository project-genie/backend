import { Router } from "express";
import {
  signUp,
  signUpCandidate,
  createSession,
} from "../controllers/auth.controller.js";

const router = Router();
router.post("/signupcandidate", signUpCandidate); // Creates a new record in the "user_candidates" table.
router.post("/signup", signUp); // Creates a new record in the "users" table.
router.post("/signin", createSession); // Creates a new record in the "sessions" table.

export default router;
