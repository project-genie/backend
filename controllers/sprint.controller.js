import { Project, ProjectMembers } from "../models/project.model.js";
import { Sprint, SprintRequirements } from "../models/sprint.model.js";

export async function getSprint(req, res) {
  const sprintId = req.params["id"];
  const { projectId } = req.body;

  try {
    const sprint = await Sprint.findByPk(sprintId, {
      where: {
        id: sprintId,
        projectId: projectId,
      },
    });

    if (!sprint) {
      return res.status(404).send({
        success: false,
        message: "Sprint not found.",
      });
    }

    return res.send({
      success: true,
      message: "Sprint found.",
      data: sprint,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while retrieving sprint.",
    });
  }
}

export async function getSprints(req, res) {
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

    const sprints = await Sprint.findAll({
      where: {
        projectId: projectId,
      },
    });

    return res.send({
      success: true,
      message: "Sprints found.",
      data: sprints,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while retrieving sprints.",
    });
  }
}

export async function createSprint(req, res) {
  const projectId = req.params["id"];
  const { name, description, startDate, endDate } = req.body;
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

    const sprint = await Sprint.create({
      name,
      description,
      projectId,
      startDate,
      endDate,
      phase: "not started",
      status: "inactive",
    });

    return res.send({
      success: true,
      message: "Sprint created successfully.",
      data: sprint,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while creating sprint.",
    });
  }
}

export async function startSprint(req, res) {
  const sprintId = req.params["id"];
  const userId = req.user.id;
  const { projectId } = req.body;
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

    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to start sprint.",
      });
    }

    const sprint = await Sprint.findByPk(sprintId, {
      where: {
        id: sprintId,
      },
    });

    if (!sprint) {
      return res.status(404).send({
        success: false,
        message: "Sprint not found.",
      });
    }

    await Sprint.update(
      {
        status: "active",
        startDate: new Date(),
      },
      {
        where: {
          id: sprintId,
        },
      }
    );

    return res.send({
      success: true,
      message: "Sprint started successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while starting sprint.",
    });
  }
}

export async function deleteSprint(req, res) {
  const sprintId = req.params["id"];
  const userId = req.user.id;
  try {
    const sprint = await Sprint.findByPk(sprintId, {
      where: {
        id: sprintId,
      },
    });

    const project = await Project.findByPk(sprint.projectId, {
      where: {
        id: sprint.projectId,
      },
    });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found.",
      });
    }
    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: sprint.projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to delete sprint.",
      });
    }

    if (!sprint) {
      return res.status(404).send({
        success: false,
        message: "Sprint not found.",
      });
    }

    await Sprint.destroy({
      where: {
        id: sprintId,
      },
    });

    return res.send({
      success: true,
      message: "Sprint deleted successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while deleting sprint.",
    });
  }
}

export async function updateSprint(req, res) {
  const sprintId = req.params["id"];
  const userId = req.user.id;
  const { projectId, name, description, phase, startDate, endDate } = req.body;
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

    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to update sprint.",
      });
    }

    const sprint = await Sprint.findByPk(sprintId, {
      where: {
        id: sprintId,
      },
    });

    if (!sprint) {
      return res.status(404).send({
        success: false,
        message: "Sprint not found.",
      });
    }

    const spr = await Sprint.update(
      {
        name: name ? name : sprint.name,
        description: description ? description : sprint.description,
        phase: phase ? phase : sprint.phase,
        startDate: startDate ? startDate : sprint.startDate,
        endDate: endDate ? endDate : sprint.endDate,
        status:
          phase !== "not started" || phase !== "completed"
            ? "active"
            : "inactive",
      },
      {
        where: {
          id: sprintId,
        },
      }
    );

    return res.send({
      success: true,
      message: "Sprint updated successfully.",
      data: spr,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while updating sprint.",
    });
  }
}

export async function endSprint(req, res) {
  const sprintId = req.params["id"];
  const userId = req.user.id;
  const { projectId } = req.body;
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

    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to end sprint.",
      });
    }

    const sprint = await Sprint.findByPk(sprintId, {
      where: {
        id: sprintId,
      },
    });

    if (!sprint) {
      return res.status(404).send({
        success: false,
        message: "Sprint not found.",
      });
    }

    const spr = await Sprint.update(
      {
        status: "completed",
        endDate: new Date(),
      },
      {
        where: {
          id: sprintId,
        },
      }
    );

    return res.send({
      success: true,
      message: "Sprint ended successfully.",
      data: spr,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while ending sprint.",
    });
  }
}

// Requirements;

export async function getSprintRequirements(req, res) {
  const sprintId = req.params["id"];
  try {
    const requirements = await SprintRequirements.findAll({
      where: {
        sprintId: sprintId,
      },
    });

    return res.send({
      success: true,
      message: "Sprint requirements retrieved successfully.",
      data: requirements,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        error.message || "Some error occurred while retrieving requirements.",
    });
  }
}

export async function createSprintRequirement(req, res) {
  const sprintId = req.params["id"];
  const userId = req.user.id;
  const { name, description } = req.body;
  try {
    const sprint = await Sprint.findByPk(sprintId, {
      where: {
        id: sprintId,
      },
    });

    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: sprint.projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to create requirement.",
      });
    }

    if (!sprint) {
      return res.status(404).send({
        success: false,
        message: "Sprint not found.",
      });
    }

    const requirement = await SprintRequirements.create({
      sprintId: sprintId,
      name: name,
      description: description,
    });

    return res.send({
      success: true,
      message: "Requirement created successfully.",
      data: requirement,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        error.message || "Some error occurred while creating requirement.",
    });
  }
}

export async function deleteSprintRequirement(req, res) {
  const sprintId = req.params["id"];
  const userId = req.user.id;
  try {
    const sprint = await Sprint.findByPk(sprintId, {
      where: {
        id: sprintId,
      },
    });

    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: sprint.projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to delete requirement.",
      });
    }

    if (!sprint) {
      return res.status(404).send({
        success: false,
        message: "Sprint not found.",
      });
    }

    const requirement = await SprintRequirements.destroy({
      where: {
        sprintId: sprintId,
      },
    });

    return res.send({
      success: true,
      message: "Requirement deleted successfully.",
      data: requirement,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        error.message || "Some error occurred while deleting requirement.",
    });
  }
}

export async function updateSprintRequirement(req, res) {
  const sprintId = req.params["id"];
  const userId = req.user.id;
  const { name, description } = req.body;
  try {
    const sprint = await Sprint.findByPk(sprintId, {
      where: {
        id: sprintId,
      },
    });

    const projectMember = await ProjectMembers.findOne({
      where: {
        projectId: sprint.projectId,
        userId: userId,
      },
    });

    if (projectMember.role !== "owner") {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to update requirement.",
      });
    }

    if (!sprint) {
      return res.status(404).send({
        success: false,
        message: "Sprint not found.",
      });
    }

    const requirement = await SprintRequirements.update(
      {
        name: name ? name : sprint.name,
        description: description ? description : sprint.description,
      },
      {
        where: {
          sprintId: sprintId,
        },
      }
    );

    return res.send({
      success: true,
      message: "Requirement updated successfully.",
      data: requirement,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        error.message || "Some error occurred while updating requirement.",
    });
  }
}
