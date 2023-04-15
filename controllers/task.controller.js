import { CompletedTask, Task } from "../models/task.model.js";
import { Project, ProjectMembers } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import {
  Organization,
  OrganizationMembers,
} from "../models/organization.model.js";
import { Op } from "sequelize";
import { predict } from "../utils/predict.js";
import { Status } from "../models/task.model.js";

/*
 * Get a task by id.
 * @param {Request} {id}
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export async function getTask(req, res) {
  // Get the project id from the request params.
  const taskId = req.params["id"];
  // Get the user id from the request.
  const userId = req.user.id;

  try {
    // Check if the task exists.
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
 * @param {Request} {name, description, priority, difficulty, assigneeId, projectId, createdBy}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the project members can create tasks.
 */
export async function createTask(req, res) {
  // Get the parameters from the request body.
  const { assigneeId, projectId, name, description, priority, difficulty } =
    req.body;
  // Get the user id from the request.
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
    // Check if the user exists.
    const user = await User.findByPk(assigneeId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const predicted_work_hours = await predict(
      user.level,
      parseInt(difficulty)
    );
    // Create the task.
    const newTask = await Task.create({
      name,
      description,
      priority,
      difficulty,
      projectId,
      assigneeId,
      createdBy: userId,
      predicted_work_hours: Math.round(predicted_work_hours),
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
 * @param {Request} {id}
 * @param {Response} {success, message}
 * @returns {Promise<Response>}
 * Only the manager of the project, creator of the task AND the assignee of the task can delete the task.
 */
export async function deleteTask(req, res) {
  // Get the task id from the request params.
  const taskId = req.params["id"];
  // Get the user id from the request.
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

    // Check if the user is authorized to perform this action.
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
 * @param {Request} {id, name, description, priority, difficulty, assigneeId, projectId, exception, status}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the manager of the project, creator of the task AND the assignee of the task can update the task.
 * */
export async function updateTask(req, res) {
  // Get the task id from the request params.
  const taskId = req.params["id"];
  // Get the user id from the request.
  const userId = req.user.id;
  // Get the parameters from the request body.
  const {
    name,
    description,
    priority,
    difficulty,
    assigneeId,
    projectId,
    exception,
    status,
  } = req.body;

  try {
    // Check the existencies.
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
    // Check if the user is authorized to perform this action.
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

    if (task.status == "completed") {
      return res.status(403).json({
        success: false,
        message: "Task is already completed. Please open another task.",
      });
    }

    const user = await User.findByPk(assigneeId);

    // If the assignee is being changed, we set the started_date to null.
    if (task.assigneeId != assigneeId) {
      const started_date = null;
      const diff = difficulty
        ? parseInt(difficulty)
        : parseInt(task.difficulty);
      const predicted_work_hours = await predict(user.level, diff);

      // Update the task
      await task.update({
        name,
        description,
        priority,
        difficulty,
        assigneeId,
        projectId,
        exception,
        status: Status.TODO,
        started_date,
        predicted_work_hours: Math.round(predicted_work_hours),
      });

      return res.json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    }

    if (status != task.status) {
      // If the status is in progress, we set the started_date.
      if (status == Status.IN_PROGRESS) {
        const started_date = new Date();

        const diff = difficulty
          ? parseInt(difficulty)
          : parseInt(task.difficulty);
        const predicted_work_hours = await predict(user.level, diff);
        //8 hours of working each day from 9:00 to 18:00
        const days = Math.floor(predicted_work_hours / 8);
        const remainderHours = predicted_work_hours % 8;

        const currentDate = new Date();

        //add days to current date
        currentDate.setDate(currentDate.getDate() + days);

        //if remainder hours exceed 18:00 add one more day and remaining hours to 9:00
        if (currentDate.getHours() + remainderHours > 18) {
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(currentDate.getHours() + remainderHours - 9);
        } else {
          currentDate.setHours(currentDate.getHours() + predicted_work_hours);
        }

        // Update the task
        await task.update({
          name,
          description,
          priority,
          difficulty,
          assigneeId,
          projectId,
          exception,
          status,
          started_date,
          predicted_completion_date: currentDate.toISOString(),
        });

        return res.json({
          success: true,
          message: "Task updated successfully",
          data: task,
        });
      } else if (status == Status.BACKLOG) {
        const started_date = null;
        const predicted_completion_date = null;
        const predicted_work_hours = null;
        // Update the task
        await task.update({
          name,
          description,
          priority,
          difficulty,
          assigneeId,
          projectId,
          exception,
          status,
          started_date,
          predicted_work_hours,
          predicted_completion_date,
        });

        return res.json({
          success: true,
          message: "Task updated successfully",
          data: task,
        });
      }
    }

    if (difficulty != task.difficulty) {
      if (task.started_date != null) {
        const diff = difficulty
          ? parseInt(difficulty)
          : parseInt(task.difficulty);

        const predicted_work_hours = await predict(user.level, diff);
        //8 hours of working each day from 9:00 to 18:00
        const days = Math.floor(predicted_work_hours / 8);
        const remainderHours = predicted_work_hours % 8;

        const currentDate = task.started_date;

        //add days to current date
        currentDate.setDate(currentDate.getDate() + days);

        //if remainder hours exceed 18:00 add one more day and remaining hours to 9:00
        if (currentDate.getHours() + remainderHours > 18) {
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(currentDate.getHours() + remainderHours - 9);
        } else {
          currentDate.setHours(currentDate.getHours() + predicted_work_hours);
        }

        // Update the task
        await task.update({
          name,
          description,
          priority,
          difficulty,
          assigneeId,
          projectId,
          exception,
          status,
          predicted_work_hours: Math.round(predicted_work_hours),
          predicted_completion_date: currentDate.toISOString(),
        });

        return res.json({
          success: true,
          message: "Task updated successfully",
          data: task,
        });
      } else {
        const diff = difficulty
          ? parseInt(difficulty)
          : parseInt(task.difficulty);
        const predicted_work_hours = await predict(user.level, diff);

        // Update the task
        await task.update({
          name,
          description,
          priority,
          difficulty,
          assigneeId,
          projectId,
          exception,
          status,
          predicted_work_hours: Math.round(predicted_work_hours),
        });

        return res.json({
          success: true,
          message: "Task updated successfully",
          data: task,
        });
      }
    }

    // Update the task
    await task.update({
      name,
      description,
      priority,
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

export async function completeTask(req, res) {
  // Get the task id from the request params.
  const taskId = req.params["id"];
  // Get the user id from the request.
  const userId = req.user.id;

  try {
    // Check the existencies.
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (task.status !== "in-progress") {
      return res.status(403).json({
        success: false,
        message: "Task is not in progress. First make it in progress.",
      });
    }

    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId: task.projectId,
      },
    });
    // Check if the user is authorized to perform this action.
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

    const diffInMs = Math.abs(new Date() - task.started_date);
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      await task.update({
        exception: true,
      });
    }

    const user = await User.findByPk(task.assigneeId);
    // Update the task
    const completedTask = await CompletedTask.create({
      task_id: taskId,
      user_id: userId,
      project_id: task.projectId,
      started_date: task.started_date,
      completed_date: new Date(),
      hours: diffInHours,
      exception: task.exception,
      user_level: user.level,
      difficulty: task.difficulty,
    });

    // Destroy the task
    await task.update({
      status: Status.COMPLETED,
    });

    return res.json({
      success: true,
      message: "Task completed successfully",
      data: completedTask,
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
 * @param {Request} {id}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the owner of the organization AND members of the project can get the tasks of a project.
 * */
export async function getTasksProject(req, res) {
  // Get the project id from the request params.
  const projectId = req.params["id"];
  // Get the user id from the request.
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
    // Get the organization
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
        status: {
          [Op.not]: Status.COMPLETED,
        },
      },
      order: [["status", "DESC"]],
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
 * @param {Request} {user: {id}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 */
export async function getTasksCurrentUser(req, res) {
  // Get the user id from the request.
  const userId = req.user.id;
  try {
    // Get the tasks of the user.
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
 * @param {Request} {{params: {organizationId, projectId, userId}, user: {id}}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the owner of the organization AND members of the project can get the tasks of a user.
 */
export async function getTasksUser(req, res) {
  // Get the organizationId, projectId, userId from the request params.
  const { organizationId, projectId, userId } = req.params;
  // Get the user id from the request.
  const currentUserId = req.user.id;
  try {
    // Get the organization
    const organization = await Organization.findByPk(organizationId);
    // Get the project
    const project = await Project.findByPk(projectId);
    // Get the user
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
    // Get the tasks of the user.
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

/*
 * Get completed tasks of a project.
 * @param {Request} {id}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 */
export async function getCompletedTasksProject(req, res) {
  try {
    // Get the project id from the request params.
    const projectId = req.params["id"];
    // Get the user id from the request.
    const userId = req.user.id;

    // Get the project
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    // Get the organization
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

    const tasks = await CompletedTask.findAll({
      where: {
        project_id: projectId,
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
