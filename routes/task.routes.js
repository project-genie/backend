import { Router } from "express";
import {
  getTask,
  deleteTask,
  updateTaskStatus,
  getTasksProject,
  getTasksCurrentUser,
  getTasksUser,
  completeTask,
  getCompletedTasksProject,
  getGPTmessage,
  getOpenTasksProject,
  createTask,
  updateTask,
  getTasksSprint,
  getTasksSprintRequirement,
} from "../controllers/task.controller.js";

const router = Router();

// CRUD
router.get("/", getTasksCurrentUser); // Get all tasks of a user.

router.post("/create", createTask); // Create a new task.
router.put("/update/:id", updateTask); // Update a task status.
router.put("/status/:id", updateTaskStatus); // Update a task status.

router.post("/:id/complete", completeTask); // Complete a task.
router.get("/:id/gpt", getGPTmessage); // chatGPT query based on task description.
router.get("/:id", getTask); // Get a task.
router.delete("/:id", deleteTask); // Delete a task.

router.get("/project/completed/:id", getCompletedTasksProject); // Get all completed tasks of a project.
router.get("/project/:id", getTasksProject); // Get all tasks of a project.
router.get("/open/project/:id", getOpenTasksProject);

router.get("/organization/:id/project/:id/user/:id", getTasksUser); // Get all tasks of a user.

router.get("/sprint/:id", getTasksSprint); // Get all tasks of a sprint.
router.get("/sprintrequirement/:id", getTasksSprintRequirement); // Get all tasks of a sprint requirement.

export default router;
