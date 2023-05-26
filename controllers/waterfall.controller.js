import { Project, ProjectMembers } from "../models/project.model.js";
import { Waterfall, WaterfallRequirements } from "../models/waterfall.model.js";

export async function updateWaterfall(req, res) {
  const waterfallId = req.params["id"];
  const userId = req.user.id;
  const { projectId, phase } = req.body;
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
        message: "You are not allowed to update waterfall.",
      });
    }

    const waterfall = await Waterfall.findByPk(waterfallId, {
      where: {
        id: waterfallId,
      },
    });

    if (!waterfall) {
      return res.status(404).send({
        success: false,
        message: "Waterfall not found.",
      });
    }

    const wtrf = await Waterfall.update(
      {
        phase,
      },
      {
        where: {
          id: waterfallId,
        },
      }
    );

    return res.send({
      success: true,
      message: "Waterfall updated successfully.",
      data: wtrf,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while updating waterfall.",
    });
  }
}

export async function createWaterfallRequirement(req, res) {
  const waterfallId = req.params["id"];
  const userId = req.user.id;
  const { name, description, projectId } = req.body;
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
        message: "You are not allowed to update waterfall.",
      });
    }

    const waterfall = await Waterfall.findByPk(waterfallId, {
      where: {
        id: waterfallId,
      },
    });

    if (!waterfall) {
      return res.status(404).send({
        success: false,
        message: "Waterfall not found.",
      });
    }

    const req = await WaterfallRequirements.create({
      name: name,
      description: description,
      projectId: projectId,
      waterfallId: waterfallId,
    });

    return res.send({
      success: true,
      message: "Waterfall requirement created.",
      data: req,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "Error creating waterfall requirement.",
    });
  }
}
