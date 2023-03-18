import { Router } from "express";
import {
  createTask,
  deleteTask,
  updateTask,
  getTasksProject,
  getTasksCurrentUser,
  getTasksUser,
} from "../controllers/task.controller.js";

const router = Router();

// CRUD
router.post("/", createTask);
router.delete("/:id", deleteTask);
router.put("/:id", updateTask);

// Other routes
router.get("/", getTasksCurrentUser); // Get all tasks of a user.
router.get("/project/:id", getTasksProject); // Get all tasks of a project.

router.get("/organization/:id/project/:id/user/:id", getTasksUser); // Get all tasks of a user.

export default router;
