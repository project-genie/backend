import { Project, ProjectMembers } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import {
  Organization,
  OrganizationMembers,
} from "../models/organization.model.js";
import {
  isOrganizationMember,
  isOrganizationOwner,
  isProjectMember,
  isProjectOwner,
} from "../utils/authorization.js";
import { Status, Task } from "../models/task.model.js";
import { Op } from "sequelize";
import { Waterfall } from "../models/waterfall.model.js";

/*
 * Create a project.
 * @param {Request} {body: {name, description, organizationId}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can create projects.
 */
export async function createProject(req, res) {
  // Get name, description and organizationId from the request body.
  const { name, description, organizationId, type } = req.body;
  // Get the user id from the request object.
  const userId = req.user.id;
  try {
    // Authorization check
    if (!isOrganizationOwner(organizationId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

    // Check if the organization exists.
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Create a new project.
    const newProject = await Project.create({
      name,
      description,
      organizationId,
      type,
    });

    if (type === "waterfall") {
      await Waterfall.create({
        projectId: newProject.id,
        name: "Waterfall",
        description: newProject.description,
        startDate: new Date(),
        endDate: req.body.endDate,
        phase: "requirements",
        status: "active",
      });
    }

    // Add the user as a member of the project.
    await ProjectMembers.create({
      projectId: newProject.id,
      userId: req.user.id,
      role: "owner",
    });

    // Add all organization owners as owners of the project.
    const owners = await OrganizationMembers.findAll({
      where: {
        organizationId,
        role: "owner",
      },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
    });

    for (const owner of owners) {
      if (owner.user.id === userId) continue;
      await ProjectMembers.create({
        projectId: newProject.id,
        userId: owner.user.id,
        role: "owner",
      });
    }

    return res.json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Delete a project.
 * @param {Request} {params: {id}, user: {id}}
 * @param {Response} {success, message}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can delete projects.
 */
export async function deleteProject(req, res) {
  // Get the project id from the request parameters.
  const projectId = req.params["id"];
  // Get the user id from the request object.
  const userId = req.user.id;
  try {
    // Find the project by primary key.
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization check
    if (!isOrganizationOwner(organizationId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

    // Delete the project.
    await project.destroy();
    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Update the project.
 * @param {Request} {body: {name, description}, params: {id}, user:{id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can update projects.
 */
export async function updateProject(req, res) {
  // Get the project name and description from the request body.
  const { name, description } = req.body;
  // Get the project id from the request parameters.
  const projectId = req.params["id"];
  // Get the user id from the request object.
  const userId = req.user.id;

  try {
    // Find the project by primary key.
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    // Authorization check
    if (!isOrganizationOwner(project.organizationId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }
    // Update the project.
    await project.update({
      name,
      description,
    });

    return res.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getNumberOfTasksProject(req, res) {
  const projectId = req.params["id"];
  try {
    const project = await Project.findByPk(projectId);
    const openTasks = await Task.findAll({
      where: {
        projectId,
        status: {
          [Op.not]: Status.COMPLETED,
        },
      },
    });

    const completedTasks = await Task.findAll({
      where: {
        project_id: projectId,
        status: {
          [Op.eq]: Status.COMPLETED,
        },
      },
    });

    const tasksData = [];

    tasksData.push({
      name: "Open Tasks",
      value: openTasks.length,
    });

    tasksData.push({
      name: "Completed Tasks",
      value: completedTasks.length,
    });

    return res.json({
      success: true,
      message: "Number of tasks fetched successfully",
      data: tasksData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Get current user projects.
 * @param {Request} {user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 */
export async function getProjectsCurrentUser(req, res) {
  // Get the user id from the request object.
  const userId = req.user.id;
  try {
    // Get all projects of the user.
    const projects = await ProjectMembers.findAll({
      where: {
        userId,
      },
      include: {
        model: Project,
        attributes: ["id", "name", "description", "organizationId"],
      },
    });
    return res.json({
      success: true,
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Get all projects of an organization.
 * @param {Request} {params: {id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can get all projects of the organization.
 */
export async function getProjectsOrganization(req, res) {
  // Get the organization id from the request parameters.
  const organizationId = req.params["id"];
  // Get the user id from the request object.
  const userId = req.user.id;
  try {
    // Authorization check
    if (!isOrganizationMember(organizationId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

    // Get all projects of the organization.
    const projects = await Project.findAll({
      where: {
        organizationId,
      },
    });
    return res.json({
      success: true,
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Get project members.
 * @param {Request} {params: {id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization and project members can get all members of the project.
 */
export async function getProjectMembers(req, res) {
  // Get the project id from the request parameters.
  const projectId = req.params["id"];
  // Get the user id from the request object.
  const userId = req.user.id;
  try {
    // Authorization check
    if (!isProjectMember(projectId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

    const members = await ProjectMembers.findAll({
      where: {
        projectId,
      },
      include: {
        model: User,
        attributes: ["id", "name", "email", "level"],
      },
    });
    return res.json({
      success: true,
      message: "Project members fetched successfully",
      data: members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Add a member to a project.
 * @param {Request} {body: {userId, role}, params:{id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can add members to a project.
 */
export async function addProjectMember(req, res) {
  // Get the userId, rolefrom the request parameters.
  const { userId, role } = req.body;
  // Get the project id from the request parameters.
  const projectId = req.params["id"];
  // Get the user id from the request object.
  const currentUserId = req.user.id;
  try {
    // Authorization check
    const project = await Project.findByPk(projectId);
    if (!isOrganizationOwner(project.organizationId, currentUserId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }
    // Check if the user is already a member of the project.
    if (isProjectMember(projectId, userId) === true) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of the project",
      });
    }

    // Add the user to the project.
    await ProjectMembers.create({
      userId,
      projectId,
      role,
    });

    return res.json({
      success: true,
      message: "Project member added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Remove a member from a project.
 * @param {Request} {body: {userId}, params:{id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can remove members from a project.
 */
export async function removeProjectMember(req, res) {
  // Get the userId from the request parameters.
  const { userId } = req.body;
  // Get the project id from the request parameters.
  const projectId = req.params["id"];
  // Get the user id from the request object.
  const currentUserId = req.user.id;
  try {
    const project = await Project.findByPk(projectId);
    if (!isOrganizationOwner(project.organizationId, currentUserId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

    if (!isProjectOwner(projectId, currentUserId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }
    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId,
      },
    });

    if (!projectMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of the project",
      });
    }
    // Remove the user from the project.
    await projectMember.destroy();

    return res.json({
      success: true,
      message: "Project member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Update a project member.
 * @param {Request} {body: {userId, role}, params:{id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can update a project member. The role can be updated.
 */
export async function updateProjectMember(req, res) {
  // Get the userId, role from the request parameters.
  const { userId, role } = req.body;
  // Get the project id from the request parameters.
  const projectId = req.params["id"];
  // Get the user id from the request object.
  const currentUserId = req.user.id;
  try {
    // Authorization check
    const project = await Project.findByPk(projectId);
    if (!isOrganizationOwner(project.organizationId, currentUserId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }
    // Check if the user is a member of the project.
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId,
      },
    });

    if (!projectMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of the project.",
      });
    }
    // Update the project member.
    await projectMember.update({
      role,
    });

    return res.json({
      success: true,
      message: "Project member updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Get Current User of project.
 * @param {Request} {params: {id}, user:{id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 */
export async function getCurrentUserProject(req, res) {
  // get project id from parameters
  const projectId = req.params["id"];
  //  get user id from request object
  const userId = req.user.id;

  try {
    // check if the user is a member of the project
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId: userId,
        projectId: projectId,
      },
    });

    if (!projectMember) {
      return res.status(404).send({
        success: false,
        message: "Project member not found.",
      });
    }

    return res.send({
      success: true,
      message: "Project member found.",
      data: projectMember,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        error.message || "Some error occurred while retrieving project member.",
    });
  }
}

/*
 * Get projects of organization for the current user.
 * @param {Request} {params: {id}, user:{id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * It is necessary for role checking for each project of the current user.
 * */
export async function getProjectsOrganizationCurrentUser(req, res) {
  // get organization id from parameters
  const organizationId = req.params["id"];
  // get user id from request object
  const userId = req.user.id;
  try {
    const projects = await Project.findAll({
      where: {
        organizationId: organizationId,
      },
      include: [
        {
          model: ProjectMembers,
          as: "project_members",
          where: {
            userId: userId,
          },
        },
      ],
    });

    if (!projects) {
      return res.status(404).send({
        success: false,
        message: "Project member not found.",
      });
    }

    return res.send({
      success: true,
      message: "Project member found.",
      data: projects,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        error.message || "Some error occurred while retrieving project member.",
    });
  }
}

/*
 * Get potential members of a project. It is basically the members of the organization that are not members of the current project. It is necessary for adding people to a project.
 * @param {Request} {params: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * */
export async function getPotentialMembers(req, res) {
  // get project id from parameters
  const projectId = req.params["id"];
  try {
    // get the project
    const project = await Project.findByPk(projectId);
    const organizationMembers = await OrganizationMembers.findAll({
      where: {
        organizationId: project.organizationId,
      },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
    });
    // get the project members
    const projectMembers = await ProjectMembers.findAll({
      where: {
        projectId: projectId,
      },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
    });

    // filter the organization members to get the potential members
    const potentialMembers = organizationMembers.filter(
      (organizationMember) =>
        !projectMembers.some(
          (projectMember) => projectMember.userId === organizationMember.userId
        )
    );

    return res.send({
      success: true,
      message: "Potential members found.",
      data: potentialMembers,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        error.message || "Some error occurred while retrieving project member.",
    });
  }
}

/*
 * Get project by id.
 * @param {Request} {params:{id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * */
export async function getProject(req, res) {
  // get project id from parameters
  const projectId = req.params["id"];
  try {
    const project = await Project.findByPk(projectId, {
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found.",
      });
    }

    return res.send({
      success: true,
      message: "Project found.",
      data: project,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while retrieving project.",
    });
  }
}
