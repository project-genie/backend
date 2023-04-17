import { OrganizationMembers } from "../models/organization.model.js";
import { ProjectMembers, Project } from "../models/project.model.js";

export async function isOrganizationMember(organizationId, userId) {
  try {
    const organizationMember = await OrganizationMembers.findOne({
      where: { organizationId, userId },
    });

    if (!organizationMember) {
      return false;
    }

    return true;
  } catch (error) {
    return null;
  }
}

export async function isOrganizationOwner(organizationId, userId) {
  try {
    const organizationMember = await OrganizationMembers.findOne({
      where: { organizationId, userId },
    });

    if (!organizationMember || !organizationMember.role === "owner") {
      return false;
    }

    return true;
  } catch (error) {
    return null;
  }
}

export async function isProjectMember(projectId, userId) {
  try {
    const projectMember = await ProjectMembers.findOne({
      where: { projectId, userId },
    });

    const project = await Project.findOne({
      where: { id: projectId },
    });

    const organizationMember = await OrganizationMembers.findOne({
      where: { organizationId: project.organizationId, userId },
    });

    if (organizationMember.role === "owner") {
      return true;
    }

    if (!projectMember) {
      return false;
    }

    return true;
  } catch (error) {
    return null;
  }
}

export async function isProjectOwner(projectId, userId) {
  try {
    const projectMember = await ProjectMembers.findOne({
      where: { projectId, userId },
    });

    const project = await Project.findOne({
      where: { id: projectId },
    });

    const organizationMember = await OrganizationMembers.findOne({
      where: { organizationId: project.organizationId, userId },
    });

    if (organizationMember.role === "owner") {
      return true;
    }

    if (!projectMember || !projectMember.role === "owner") {
      return false;
    }

    return true;
  } catch (error) {
    return null;
  }
}
