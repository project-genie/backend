import {
  Organization,
  OrganizationMembers,
  Invite,
} from "../models/organization.model.js";
import { User } from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import sgMail from "@sendgrid/mail";
import envConfig from "../config/env.config.js";

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
  const userId = req.user.id;
  // Get the organization id from the request parameters.
  const organizationId = req.params["id"];
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

// Invite a user to an organization.
export async function inviteUserToOrganization(req, res) {
  const { email } = req.body;
  const organizationId = req.params["id"];

  const userId = req.user.id;

  try {
    // Authorization check.
    const currentUser = await OrganizationMembers.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!currentUser || currentUser.role !== "owner") {
      return res.status(401).json({
        success: false,
        message: "You are unauthorized to perform this action.",
      });
    }

    // Find the user by email.
    const user = await User.findOne({
      where: {
        email,
      },
    });

    // If user not found, return error.
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found in our records.",
      });
    }

    // Check if the user is already a member of the organization.
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        organizationId,
        userId: user.id,
      },
    });

    // If user is already a member, return error.
    if (organizationMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of the organization",
      });
    }

    const secret = uuidv4();
    const invite = await Invite.create({
      organizationId,
      email: email,
      userId: user.id,
      secret: secret,
    });

    sgMail.setApiKey(envConfig.SENDGRID_KEY);

    // Send Mail with the link to continue.
    const msg = {
      to: req.body.email, // Change to your recipient
      from: "mertplayschess@outlook.com", // Change to your verified sender
      subject: "Project Genie Organization Invitation",
      text:
        "Someone invited you to their organization! See the link below to accept or reject the organization: \n" +
        "http://localhost:3000/organizations/invite?secret=" +
        secret +
        "&email=" +
        req.body.email,
      html:
        "Someone invited you to their organization! See the link below to accept or reject the organization: \n" +
        "http://localhost:3000/organizations/invite?secret=" +
        secret +
        "&email=" +
        req.body.email,
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    return res.json({
      success: true,
      message: "User invited successfully",
      data: invite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Accept an invitation to an organization. Use organization_members table.
export async function acceptInvitation(req, res) {
  const { secret } = req.body;
  const userId = req.user.id;
  try {
    const invite = await Invite.findOne({
      where: {
        secret,
        userId,
      },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found",
      });
    }

    const organizationMember = await OrganizationMembers.create({
      organizationId: invite.organizationId,
      userId: invite.userId,
      role: "member",
    });

    await invite.destroy();

    return res.json({
      success: true,
      message: "Invite accepted successfully.",
      data: organizationMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Reject an invitation to an organization. Use organization_members table.
export async function rejectInvitation(req, res) {
  const { secret } = req.body;
  const userId = req.user.id;
  try {
    const invite = await Invite.findOne({
      where: {
        secret,
        userId,
      },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found",
      });
    }

    await invite.destroy();

    return res.json({
      success: true,
      message: "Invite rejected successfully.",
      data: organizationMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
