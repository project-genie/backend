import { Project, ProjectMembers } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { Organization } from "../models/organization.model.js";

// Create a new project.
export async function createProject(req, res) {
  const { name, description, organizationId } = req.body;

  try {
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

// Delete a project.
export async function deleteProject(req, res) {
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

// Update a project.
export async function updateProject(req, res) {
  // Get the project name and description from the request body.
  const { name, description } = req.body;

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

// Get all projects of the current user.
export async function getProjectsCurrentUser(req, res) {
  const userId = req.user.id;
  try {
    const projects = await ProjectMembers.findAll({
      where: {
        userId,
      },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
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

// Get all projects of an organization.
export async function getProjectsOrganization(req, res) {
  const organizationId = req.params["id"];
  try {
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

// Get all members of a project.
export async function getProjectMembers(req, res) {
  const projectId = req.params["id"];
  try {
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
