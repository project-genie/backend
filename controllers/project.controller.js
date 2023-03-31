import { Project, ProjectMembers } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import {
  Organization,
  OrganizationMembers,
} from "../models/organization.model.js";

/*
 * Create a project.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can create projects.
 */
export async function createProject(req, res) {
  const { name, description, organizationId } = req.body;
  const userId = req.user.id;
  try {
    // Authorization check
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId,
        organizationId,
      },
    });

    if (!organizationMember || organizationMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized.",
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

    const newProject = await Project.create({
      name,
      description,
      organizationId,
    });

    await ProjectMembers.create({
      projectId: newProject.id,
      userId: req.user.id,
      role: "owner",
    });

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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can delete projects.
 */
export async function deleteProject(req, res) {
  const projectId = req.params["id"];
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
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId,
        organizationId: project.organizationId,
      },
    });

    if (!organizationMember || organizationMember.role !== "owner") {
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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can update projects.
 */
export async function updateProject(req, res) {
  // Get the project name and description from the request body.
  const { name, description } = req.body;
  const userId = req.user.id;

  // Get the project id from the request parameters.
  const projectId = req.params["id"];

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
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId,
        organizationId: project.organizationId,
      },
    });

    if (!organizationMember || organizationMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

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

/*
 * Get current user projects.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function getProjectsCurrentUser(req, res) {
  const userId = req.user.id;
  try {
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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can get all projects of the organization.
 */
export async function getProjectsOrganization(req, res) {
  const organizationId = req.params["id"];
  const userId = req.user.id;
  try {
    // Authorization check
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId,
        organizationId,
      },
    });

    if (!organizationMember || organizationMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization and project members can get all members of the project.
 */
export async function getProjectMembers(req, res) {
  const projectId = req.params["id"];
  const userId = req.user.id;
  try {
    // Authorization check
    const project = await Project.findByPk(projectId);
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId,
        organizationId: project.organizationId,
      },
    });
    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId,
      },
    });

    if (!projectMember && organizationMember.role !== "owner") {
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
        attributes: ["id", "name", "email"],
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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can add members to a project.
 */
export async function addProjectMember(req, res) {
  const { userId, role } = req.body;
  const projectId = req.params["id"];
  const currentUserId = req.user.id;
  try {
    // Authorization check
    const project = await Project.findByPk(projectId);
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId: currentUserId,
        organizationId: project.organizationId,
      },
    });

    if (!organizationMember || organizationMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

    const projectMember = await ProjectMembers.findOne({
      where: {
        userId,
        projectId,
      },
    });

    if (projectMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of the project",
      });
    }

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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can remove members from a project.
 */
export async function removeProjectMember(req, res) {
  const { userId } = req.body;
  const projectId = req.params["id"];
  const currentUserId = req.user.id;
  try {
    const project = await Project.findByPk(projectId);
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId: currentUserId,
        organizationId: project.organizationId,
      },
    });

    if (!organizationMember || organizationMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can update a project member. The role can be updated.
 */
export async function updateProjectMember(req, res) {
  const { userId, role } = req.body;
  const projectId = req.params["id"];
  const currentUserId = req.user.id;
  try {
    // Authorization check
    const project = await Project.findByPk(projectId);
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId: currentUserId,
        organizationId: project.organizationId,
      },
    });

    if (!organizationMember || organizationMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function getCurrentUserProject(req, res) {
  // get project id from parameters
  const projectId = req.params["id"];

  const userId = req.user.id;

  try {
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

export async function getProjectsOrganizationCurrentUser(req, res) {
  const organizationId = req.params["id"];

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

export async function getPotentialMembers(req, res) {
  const projectId = req.params["id"];

  try {
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

    const projectMembers = await ProjectMembers.findAll({
      where: {
        projectId: projectId,
      },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
    });

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

export async function getProject(req, res) {
  const projectId = req.params["id"];
  const userId = req.user.id;

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
