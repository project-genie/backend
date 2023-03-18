import {
  Organization,
  OrganizationMembers,
} from "../models/organization.model.js";
import { User } from "../models/user.model.js";

export async function createOrganization(req, res) {
  const { name, description } = req.body;
  try {
    // Create the organization.
    const newOrganization = await Organization.create({
      name,
      description,
    });

    // Add the owner to the organization with the 'owner' role.
    await OrganizationMembers.create({
      organizationId: newOrganization.id,
      userId: req.user.id,
      role: "owner",
    });

    // Return success message.
    return res.json({
      success: true,
      message: "Organization created successfully",
      data: newOrganization,
    });
  } catch (error) {
    // Return error message.
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteOrganization(req, res) {
  const organizationId = req.params["id"];
  try {
    // Find the organization by primary key.
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Delete the organization.
    await organization.destroy();
    return res.json({
      message: "Organization deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function updateOrganization(req, res) {
  // Get the name and description from the request body.
  const { name, description } = req.body;

  // Get the organization id from the request parameters.
  const organizationId = req.params["id"];
  try {
    // Find the organization by primary key.
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }
    // Update the organization.
    await organization.update({
      name,
      description,
    });
    return res.json({
      success: true,
      message: "Organization updated successfully",
      data: organization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Get current user's organizations. Use organization_members table.
export async function getOrganizations(req, res) {
  // Get the user id from the request object.
  const userId = req.user.id;
  try {
    // Find all organizations where the user is a member.
    const organizations = await OrganizationMembers.findAll({
      where: {
        userId,
      },
      include: {
        model: Organization,
        attributes: ["id", "name", "description"],
      },
    });
    return res.json({
      success: true,
      message: "Organizations fetched successfully",
      data: organizations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all users of an organization. Use organization_members table.
export async function getOrganizationMembers(req, res) {
  const organizationId = req.params["id"];
  try {
    // Find all users where the user is a member of the organization.
    const organizationMembers = await OrganizationMembers.findAll({
      where: {
        organizationId,
      },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
    });
    return res.json({
      success: true,
      message: "Organization members fetched successfully",
      data: organizationMembers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
