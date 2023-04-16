import { Router } from "express";
import {
  getTask,
  createTask,
  deleteTask,
  updateTask,
  getTasksProject,
  getTasksCurrentUser,
  getTasksUser,
  completeTask,
  getCompletedTasksProject,
  getGPTmessage,
} from "../controllers/task.controller.js";

const router = Router();

// CRUD
router.post("/", createTask); // Create a new task.
router.get("/", getTasksCurrentUser); // Get all tasks of a user.

router.post("/:id/complete", completeTask); // Complete a task.
router.get("/:id/gpt", getGPTmessage); // chatGPT query based on task description.
router.get("/:id", getTask); // Get a task.
router.delete("/:id", deleteTask); // Delete a task.
router.put("/:id", updateTask); // Update a task.

router.get("/project/completed/:id", getCompletedTasksProject); // Get all completed tasks of a project.
router.get("/project/:id", getTasksProject); // Get all tasks of a project.
router.get("/organization/:id/project/:id/user/:id", getTasksUser); // Get all tasks of a user.

export default router;
