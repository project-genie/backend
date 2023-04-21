import { Router } from "express";
import {
  getTask,
  acceptTaskCandidate,
  deleteTask,
  updateTaskStatus,
  getTasksProject,
  getTasksCurrentUser,
  getTasksUser,
  completeTask,
  getCompletedTasksProject,
  getGPTmessage,
  createTaskCandidate,
  getUsersTaskCandidates,
  rejectTaskCandidate,
  getProjectTaskCandidates,
  getOpenTasksProject,
} from "../controllers/task.controller.js";

const router = Router();

// CRUD
router.get("/candidate", getUsersTaskCandidates); // Get all candidate tasks of a user.

router.post("/candidate", createTaskCandidate); // Create a new task.
router.get("/candidate/:id/all", getProjectTaskCandidates);
router.post("/candidate/:id/accept", acceptTaskCandidate); // Create a new task.
router.post("/candidate/:id/reject", rejectTaskCandidate); // Create a new task.

router.get("/", getTasksCurrentUser); // Get all tasks of a user.

router.post("/:id/complete", completeTask); // Complete a task.
router.get("/:id/gpt", getGPTmessage); // chatGPT query based on task description.
router.get("/:id", getTask); // Get a task.
router.delete("/:id", deleteTask); // Delete a task.

router.put("/:id", updateTaskStatus); // Update a task status.

router.get("/project/completed/:id", getCompletedTasksProject); // Get all completed tasks of a project.
router.get("/project/:id", getTasksProject); // Get all tasks of a project.
router.get("/open/project/:id", getOpenTasksProject);

router.get("/organization/:id/project/:id/user/:id", getTasksUser); // Get all tasks of a user.

export default router;
