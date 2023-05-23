import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import {
  Invite,
  Organization,
  OrganizationMembers,
} from "../models/organization.model.js";

/*
 * Logout.
 * @param {Request} {user:{id}}
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function signOut(req, res) {
  // Get the user id from the request.
  const userId = req.user.id;
  const sessions = await Session.findAll({
    where: {
      userId,
    },
  });
  // Destroy all sessions for this user.
  sessions.forEach(async (session) => {
    await session.destroy();
  });

  res.cookie("accessToken", "", {
    maxAge: 0,
    httpOnly: true,
    // sameSite: "none",
  });

  res.cookie("refreshToken", "", {
    maxAge: 0,
    httpOnly: true,
    // sameSite: "none",
  });

  return res.send();
}

/*
 * Get user.
 * @param {Request} {params:{id}}
 * @param {Response} {}
 * @returns {Promise<Response>}
 * */
export async function getUser(req, res) {
  // Get the user id from the request.
  const id = req.params["id"];
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }
    return res.send({
      success: true,
      message: "User found.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
}

/*
 * Get current user invites.
 * @param {Request} {user:{id}}
 * @param {Response} {}
 * @returns {Promise<Response>}
 * */
export async function getCurrentUserInvites(req, res) {
  // Get the user id from the request.
  const userId = req.user.id;
  try {
    // Get all invites for the user.
    const invites = await Invite.findAll({
      where: {
        userId,
      },
      include: {
        model: Organization,
        attributes: ["id", "name"],
      },
    });

    return res.send({
      success: true,
      message: "Invites found.",
      data: invites,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
}

/*
 * Get current user.
 * @param {Request} {}
 * @param {Response} {data: user: {id, name, email, level createdAt}}
 * @returns {Promise<Response>}
 * */
export async function getCurrentUser(req, res) {
  try {
    // Get the user id from the request.
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }
    return res.send({
      success: true,
      message: "User found.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
}

/*
 * Update user.
 * @param {Request} {params:{id}, body:{name}}
 * @param {Response} {data: user: {id, name, email, level createdAt}}
 * @returns {Promise<Response>}
 * */
export async function updateUser(req, res) {
  try {
    // Get the user id from the request.
    const id = req.params["id"];
    const userId = req.user.id;
    const { name, level, organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).send({
        success: false,
        message: "Organization id is required.",
      });
    }

    const organizationMember = await OrganizationMembers.findOne({
      where: {
        userId,
        organizationId,
      },
    });
    if (!organizationMember) {
      return res.status(403).send({
        success: false,
        message: "You are not a member of this organization.",
      });
    }

    if (organizationMember.role !== "owner") {
      return res.status(403).send({
        success: false,
        message: "You do not have permission to update this user.",
      });
    }

    const user = await User.findByPk(id);

    const userOrganizationMember = await OrganizationMembers.findOne({
      where: {
        userId: user.id,
        organizationId,
      },
    });

    if (!userOrganizationMember) {
      return res.status(403).send({
        success: false,
        message: "This user is not a member of this organization.",
      });
    }

    if (name) user.name = name;
    if (level) {
      if (level > 10 || level < 1) {
        return res.status(400).send({
          success: false,
          message: "Level is not in appropiate interval.",
        });
      }
      user.level = level;
    }

    await user.save();
    return res.send({
      success: true,
      message: "User updated.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
}
