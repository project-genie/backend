import { Router } from "express";
import {
  signUp,
  signUpCandidate,
  createSession,
  deleteSession,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signupcandidate", signUpCandidate);
router.post("/signup", signUp);
router.post("/signin", createSession);
router.post("/signout", deleteSession);

export default router;
