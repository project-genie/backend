import { Task } from "../models/task.model.js";
import { Project, ProjectMembers } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import {
  Organization,
  OrganizationMembers,
} from "../models/organization.model.js";

export async function getTask(req, res) {
  const taskId = req.params["id"];
  const userId = req.user.id;

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId: task.projectId,
      },
    });

    if (!projectMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    return res.json({
      success: true,
      message: "Task found",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Create Task.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the project members can create tasks.
 */
export async function createTask(req, res) {
  const {
    assigneeId,
    projectId,
    name,
    description,
    priority,
    dueDate,
    difficulty,
    createdBy,
  } = req.body;
  const userId = req.user.id;
  try {
    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId,
      },
    });

    if (!projectMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    // Check if the assignee is a member of the project.
    const assigneeMember = await ProjectMembers.findOne({
      where: {
        userId: assigneeId,
        projectId,
      },
    });

    if (!assigneeMember) {
      return res.status(403).json({
        success: false,
        message: "The assignee is not a member of this project",
      });
    }

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
      createdBy,
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

/*
 * Delete Task.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the manager of the project, creator of the task AND the assignee of the task can delete the task.
 */
export async function deleteTask(req, res) {
  const taskId = req.params["id"];
  const userId = req.user.id;

  try {
    // Check the existencies.
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId: task.projectId,
      },
    });

    if (
      !projectMember ||
      (userId !== task.assigneeId &&
        projectMember.role !== "owner" &&
        userId !== task.createdBy)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
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

/*
 * Update task of a project.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the manager of the project, creator of the task AND the assignee of the task can update the task.
   TODO: If status is being 'completed', we may need to perform additional actions. Such as calculating the time taken to complete the task. It will determine the performance of the assignee.
 * */
export async function updateTask(req, res) {
  const taskId = req.params["id"];
  const userId = req.user.id;
  const {
    name,
    description,
    priority,
    dueDate,
    difficulty,
    assigneeId,
    projectId,
    exception,
    status,
  } = req.body;

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId: task.projectId,
      },
    });

    if (
      !projectMember ||
      (userId !== task.assigneeId &&
        projectMember.role !== "owner" &&
        userId !== task.createdBy)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
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
      exception,
      status,
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

/*
 * Get all tasks of a project.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the owner of the organization AND members of the project can get the tasks of a project.
 * */
export async function getTasksProject(req, res) {
  const projectId = req.params["id"];
  const userId = req.user.id;
  try {
    // Get the organization
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    const organization = await Organization.findByPk(project.organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Check if the user is a member of the organization.
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId,
        organizationId: organization.id,
      },
    });

    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId,
      },
    });

    if (!projectMember && organizationMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

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

/*
 * Get all tasks of the current user.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
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

/*
 * Get all tasks of a user.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the owner of the organization AND members of the project can get the tasks of a user.
 */
export async function getTasksUser(req, res) {
  const { organizationId, projectId, userId } = req.params;
  const currentUserId = req.user.id;
  try {
    const organization = await Organization.findByPk(organizationId);
    const project = await Project.findByPk(projectId);
    const user = await User.findByPk(userId);

    // Check if the user is a member of the organization.
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId: currentUserId,
        organizationId: organization.id,
      },
    });

    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId: currentUserId,
        projectId,
      },
    });

    if (!projectMember || organizationMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    if (!project || !user || !organization) {
      return res.status(404).json({
        success: false,
        message: "User, Project, or Organization not found",
      });
    }

    const tasks = await Task.findAll({
      where: {
        assigneeId: userId,
        projectId: project.id,
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
