import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { Organization } from "../models/organization.model.js";

export async function createTask(req, res) {
  const {
    assigneeId,
    projectId,
    name,
    description,
    priority,
    dueDate,
    difficulty,
  } = req.body;

  try {
    // Check if project or user exists.
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const user = await User.findByPk(assigneeId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newTask = await Task.create({
      name,
      description,
      priority,
      dueDate,
      difficulty,
      projectId,
      assigneeId,
    });

    return res.json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteTask(req, res) {
  const taskId = req.params["id"];

  try {
    // Check the existencies.
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Delete the task.
    await task.destroy();

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateTask(req, res) {
  const taskId = req.params["id"];
  const {
    name,
    description,
    priority,
    dueDate,
    difficulty,
    assigneeId,
    projectId,
  } = req.body;

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.update({
      name,
      description,
      priority,
      dueDate,
      difficulty,
      assigneeId,
      projectId,
    });
    return res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTasksProject(req, res) {
  const projectId = req.params["id"];
  try {
    const tasks = await Task.findAll({
      where: {
        projectId,
      },
    });
    return res.json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTasksCurrentUser(req, res) {
  const userId = req.user.id;

  try {
    const tasks = await Task.findAll({
      where: {
        assigneeId: userId,
      },
    });

    return res.json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTasksUser(req, res) {
  const { organizationId, projectId, userId } = req.params;
  try {
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const tasks = await Task.findAll({
      where: {
        assigneeId: userId,
        projectId: project.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
