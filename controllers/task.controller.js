import { Task } from "../models/task.model.js";
import { Project, ProjectMembers } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import {
  Organization,
  OrganizationMembers,
} from "../models/organization.model.js";
import { Op } from "sequelize";
import { predict } from "../utils/predict.js";
import { Status } from "../models/task.model.js";
import { Configuration, OpenAIApi } from "openai";
import envConfig from "../config/env.config.js";
import { isProjectMember, isProjectOwner } from "../utils/authorization.js";

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
    if (!isProjectMember(task.projectId, userId)) {
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

export async function createTask(req, res) {
  const {
    name,
    description,
    priority,
    difficulty,
    projectId,
    assigneeId,
    sprintId,
    sprintRequirementId,
  } = req.body;
  const userId = req.user.id;
  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this project",
      });
    }

    const assignee = await User.findByPk(assigneeId);
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: "Assignee not found",
      });
    }

    const prediction = await predict(assignee.level, difficulty);

    const task = await Task.create({
      name: name,
      description: description,
      projectId: projectId,
      assigneeId: assigneeId,
      priority: priority,
      difficulty: difficulty,
      sprint: sprintId,
      sprint_requirement: sprintRequirementId,
      createdBy: userId,
      predicted_work_hours: parseInt(prediction),
    });

    return res.json({
      success: true,
      message: "Task created",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateTask(req, res) {
  const { name, description, priority, difficulty, projectId, assigneeId } =
    req.body;
  const userId = req.user.id;
  const taskId = req.params["id"];

  try {
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this project",
      });
    }

    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    if (name) {
      task.name = name;
    }
    if (description) {
      task.description = description;
    }
    if (priority) {
      task.priority = priority;
    }
    if (difficulty) {
      task.difficulty = difficulty;
    }
    if (assigneeId) {
      task.assigneeId = assigneeId;
    }

    await task.save();

    return res.json({
      success: true,
      message: "Task updated.",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
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
    if (!isProjectMember(task.projectId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
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
export async function updateTaskStatus(req, res) {
  // Get the task id from the request params.
  const taskId = req.params["id"];
  // Get the user id from the request.
  const userId = req.user.id;
  // Get the parameters from the request body.
  const { status } = req.body;

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
    if (!isProjectMember(task.projectId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project.",
      });
    }

    if (task.assigneeId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not the assignee of this task.",
      });
    }

    if (task.status == "completed") {
      return res.status(403).json({
        success: false,
        message: "Task is already completed. Please open another task.",
      });
    }

    if (status != task.status) {
      // If the status is in progress, we set the started_date.
      if (status == Status.IN_PROGRESS) {
        const started_date = new Date();

        //8 hours of working each day from 9:00 to 18:00
        const days = Math.floor(task.predicted_work_hours / 8);
        const remainderHours = task.predicted_work_hours % 8;

        const currentDate = new Date();

        //add days to current date
        currentDate.setDate(currentDate.getDate() + days);

        //if remainder hours exceed 18:00 add one more day and remaining hours to 9:00
        if (currentDate.getHours() + remainderHours > 18) {
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(currentDate.getHours() + remainderHours - 9);
        } else {
          currentDate.setHours(
            currentDate.getHours() + task.predicted_work_hours
          );
        }

        // Update the task
        await task.update({
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
        // Update the task
        await task.update({
          status,
          started_date,
          predicted_completion_date,
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
    if (!isProjectMember(task.projectId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of the project.",
      });
    }

    const diffInMs = Math.abs(new Date() - task.started_date);
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      await task.update({
        exception: true,
      });
    }

    await task.update({
      status: Status.COMPLETED,
    });

    return res.json({
      success: true,
      message: "Task completed successfully",
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
    console.log("Project fount: ", project);
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

export async function getOpenTasksProject(req, res) {
  const projectId = req.params["id"];
  try {
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
    return res.status(500).json({
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
    if (!isProjectMember(projectId, currentUserId)) {
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
    if (!isProjectMember(projectId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    const tasks = await Task.findAll({
      where: {
        project_id: projectId,
        status: {
          [Op.eq]: Status.COMPLETED,
        },
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

export async function getGPTmessage(req, res) {
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
    if (!isProjectMember(task.projectId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    const configuration = new Configuration({
      apiKey: envConfig.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const gptResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: task.description,
      temperature: 1,
      max_tokens: 100,
    });
    return res.json({
      success: true,
      message: "GPT replied",
      data: gptResponse.data.choices[0].text.trim(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTasksSprint(req, res) {
  const sprintId = req.params["id"];
  const userId = req.user.id;

  try {
    const sprint = await Sprint.findByPk(sprintId);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    const project = await Project.findByPk(sprint.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const tasks = await Task.findAll({
      where: {
        sprintId: sprintId,
      },
    });

    return res.json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTasksSprintRequirement(req, res) {
  const sprintRequirementId = req.params["id"];
  try {
    const tasks = await Task.findAll({
      where: {
        sprint_requirement: sprintRequirementId,
      },
    });

    return res.json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
