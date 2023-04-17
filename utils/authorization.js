import { OrganizationMembers } from "../models/organization.model.js";

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
