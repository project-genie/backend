import {
  Organization,
  OrganizationMembers,
  Invite,
} from "../models/organization.model.js";
import { User } from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import sgMail from "@sendgrid/mail";
import envConfig from "../config/env.config.js";
import {
  isOrganizationMember,
  isOrganizationOwner,
} from "../utils/authorization.js";

/*
 * @param {Request} {body: {name, description}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 */
export async function createOrganization(req, res) {
  // Get the organization name and description from the request body.
  const { name, description } = req.body;

  // Get the current user id from the request object.
  const userId = req.user.id;
  try {
    // Create the organization.
    const newOrganization = await Organization.create({
      name,
      description,
    });

    // Add the owner to the organization with the 'owner' role.
    await OrganizationMembers.create({
      organizationId: newOrganization.id,
      userId,
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

/*
  * Delete an organization.
  * @param {Request} {params: {id}, user: {id}}
  * @param {Response} {success, message}
  * @returns {Promise<Response>}
  * Only the 'owner' of the organization can delete the organization.
  TODO: Add mail approval for deleting the organization.
*/
export async function deleteOrganization(req, res) {
  // Get the organization id from the request parameters.
  const organizationId = req.params["id"];

  // Get the current user id from the request object.
  const userId = req.user.id;
  try {
    if (!isOrganizationOwner(organizationId, userId)) {
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

/*
 * Delete an organization.
 * @param {Request} {params: {id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 */
export async function getOrganization(req, res) {
  // Get the organization id from the request parameters.
  const organizationId = req.params["id"];

  // Get the current user id from the request object.
  const userId = req.user.id;
  try {
    // Authorization check
    if (!isOrganizationMember(organizationId, userId)) {
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
    return res.json({
      success: true,
      message: "Organization fetched successfully",
      data: organization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
/*
 * Update an organization.
 * @param {Request} {body: {id, name, description}, user: {id}, params: {id}}
 * @param {Response} res
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can update the organization.
 */
export async function updateOrganization(req, res) {
  // Get the organization id from the request parameters.
  const organizationId = req.params["id"];

  // Get the name and description from the request body.
  const { name, description } = req.body;

  // Get the current user id from the request object.
  const userId = req.user.id;

  try {
    // Authorization check
    if (!isOrganizationOwner(organizationId, userId)) {
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

/*
 * Get organizations.
 * @param {Request} {user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Get current user's all organizations.
 */
export async function getOrganizations(req, res) {
  // Get the user id from the request object.
  const userId = req.user.id;
  try {
    // Find all organizations where the user is a member.
    const organizations = await Organization.findAll({
      include: {
        model: OrganizationMembers,
        where: {
          userId,
        },
      },
    });

    return res.json({
      success: true,
      message: "Organizations fetched successfully",
      data: organizations,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Get organization members.
 * @param {Request} {params: {id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Organization members can view the members of the organization.
 */
export async function getOrganizationMembers(req, res) {
  // Get the organization id from the request parameters.
  const organizationId = req.params["id"];

  // Get the current user id from the request object.
  const userId = req.user.id;
  try {
    // Authorization check.
    if (!isOrganizationMember(organizationId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized.",
      });
    }
    // Find all users where the user is a member of the organization.
    const organizationMembers = await OrganizationMembers.findAll({
      where: {
        organizationId,
      },
      include: {
        model: User,
        attributes: ["id", "name", "email", "level"],
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

/*
 * Invite user to organization.
 * @param {Request} {body: {email}, params: {id}, user: {id}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can invite a user to the organization.
 */
export async function inviteUserToOrganization(req, res) {
  // Get the organization id from the request parameters.
  const { email } = req.body;

  // Get the organization id from the request parameters.
  const organizationId = req.params["id"];

  // Get the current user id from the request object.
  const userId = req.user.id;

  try {
    // Authorization check.
    if (!isOrganizationOwner(organizationId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized.",
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

/*
 * Accept an invitation.
 * @param {Request} {body: {secret}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * User can accept an invitation to an organization.
 */
export async function acceptInvitation(req, res) {
  // Get the secret from the request body.
  const { secret } = req.body;

  // Get the current user id from the request object.
  const userId = req.user.id;
  try {
    // Find the invite by secret and userId.
    const invite = await Invite.findOne({
      where: {
        secret,
        userId,
      },
    });

    // If invite not found, return error.
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found",
      });
    }

    // Create a new organization member.
    const organizationMember = await OrganizationMembers.create({
      organizationId: invite.organizationId,
      userId: invite.userId,
      role: "member",
    });

    // Delete the invite.
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

/*
 * Reject an invitation.
 * @param {Request} {body: {secret}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * User can reject an invitation to an organization.
 */
export async function rejectInvitation(req, res) {
  // Get the secret from the request body.
  const { secret } = req.body;

  // Get the current user id from the request object.
  const userId = req.user.id;
  try {
    // Find the invite by secret and userId.
    const invite = await Invite.findOne({
      where: {
        secret,
        userId,
      },
    });

    // If invite not found, return error.
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found",
      });
    }

    // Delete the invite.
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

/*
 * Remove a member from an organization.
 * @param {Request} {body: {secret}, user: {id}, params: {id, userId}
 * @param {Response} { success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can remove a member from the organization.
 * The owner cannot remove themselves from the organization.
 * The owner cannot remove another owner from the organization.
 * The owner cannot remove the last owner from the organization.
 */
export async function removeOrganizationMember(req, res) {
  // Get the organization id and user id from the request params.
  const organizationId = req.params["id"];
  const userId = req.params["userId"];
  // Get the current user id from the request object.
  const currentUserId = req.user.id;

  try {
    // Authorization check.
    if (!isOrganizationOwner(currentUserId, organizationId)) {
      return res.status(401).json({
        success: false,
        message:
          "You are not authorized to remove a member from the organization.",
      });
    }

    // Check if the user is a member of the organization.
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    // If user is not a member, return error.
    if (!organizationMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of the organization",
      });
    }

    // Check if the user is the owner of the organization.
    if (organizationMember.role === "owner") {
      return res.status(400).json({
        success: false,
        message: "You cannot remove an owner of the organization.",
      });
    }

    await organizationMember.destroy();

    return res.json({
      success: true,
      message: "User removed from the organization successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Update a member's role in an organization.
 * @param {Request} {body: {userId, role}, user: {id}, params: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * Only the 'owner' of the organization can update a member's role in the organization.
 */
export async function updateOrganizationMember(req, res) {
  // Get the organization id from the request params.
  const organizationId = req.params["id"];
  // Get the user id and role from the request body.
  const { userId, role } = req.body;
  // Get the current user id from the request object.
  const currentUserId = req.user.id;
  try {
    // Authorization check.
    if (!isOrganizationOwner(organizationId, currentUserId)) {
      return res.status(401).json({
        success: false,
        message:
          "You are not authorized to update a member's role in the organization.",
      });
    }

    // Check if the user is a member of the organization.
    const organizationOwners = await OrganizationMembers.findAll({
      where: {
        organizationId,
        role: "owner",
      },
    });
    // If user is the only owner, return error.
    if (
      organizationOwners.length === 1 &&
      organizationOwners.filter((o) => o.userId === userId).length === 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot change the role of the only owner of the organization.",
      });
    }
    // Check if the user is a member of the organization.
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!organizationMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of the organization",
      });
    }
    // Check if the user is the owner of the organization.
    await organizationMember.update({
      role,
    });

    return res.json({
      success: true,
      message: "User role updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Get Current User of organization.
 * @param {Request} {params: {id}, user: {id}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 */
export async function getCurrentUserOrganization(req, res) {
  // get organization id from parameters
  const organizationId = req.params["id"];
  // get user id from request object
  const userId = req.user.id;

  try {
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId: userId,
        organizationId: organizationId,
      },
    });

    if (!organizationMember) {
      return res.status(404).send({
        success: false,
        message: "Organization member not found.",
      });
    }

    return res.send({
      success: true,
      message: "Organization member found.",
      data: organizationMember,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        error.message ||
        "Some error occurred while retrieving organization member.",
    });
  }
}

/*
 * Get All Invites of an organization.
 * @param {Request} {params: {id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * */
export async function getOrganizationInvites(req, res) {
  // get organization id from parameters
  const organizationId = req.params["id"];
  // get user id from request object
  const userId = req.user.id;

  try {
    // Authorization check.
    if (!isOrganizationOwner(organizationId, userId)) {
      return res.status(401).json({
        success: false,
        message:
          "You are not authorized to view invites for this organization.",
      });
    }

    const invites = await Invite.findAll({
      where: {
        organizationId,
      },
    });

    return res.json({
      success: true,
      message: "Invites found.",
      data: invites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Remove an invite from an organization.
 * @param {Request} {body: {userId}, user: {id}, params: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * */
export async function removeInvitation(req, res) {
  const organizationId = req.params["id"];
  const { userId } = req.body;
  const currentUserId = req.user.id;

  try {
    if (!isOrganizationOwner(organizationId, currentUserId)) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to remove this invite.",
      });
    }

    const invite = await Invite.findOne({
      where: {
        userId,
        organizationId,
      },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found.",
      });
    }

    await invite.destroy();

    return res.json({
      success: true,
      message: "Invite removed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
 * Leave an organization.
 * @param {Request} {params: {id}, user: {id}}
 * @param {Response} {success, message, data}
 * @returns {Promise<Response>}
 * */

export async function leaveOrganization(req, res) {
  // get organization id from parameters
  const organizationId = req.params["id"];
  // get user id from request object
  const userId = req.user.id;

  try {
    // Check if the user is a member of the organization.
    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId,
        organizationId,
      },
    });

    // If user is not a member of the organization, return error.
    if (!organizationMember) {
      return res.status(404).json({
        success: false,
        message: "Organization member not found.",
      });
    }

    // If user is the owner of the organization, return error.
    if (organizationMember.role === "owner") {
      return res.status(400).json({
        success: false,
        message: "You cannot leave an organization you own.",
      });
    }

    // Delete the organization member.
    await organizationMember.destroy();

    return res.json({
      success: true,
      message: "You have left the organization successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
