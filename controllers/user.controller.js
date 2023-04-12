import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import { Invite, Organization } from "../models/organization.model.js";

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
    const { name } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }
    user.name = name;
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
