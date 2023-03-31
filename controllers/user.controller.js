import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import { Invite, Organization } from "../models/organization.model.js";

/*
 * Logout.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function signOut(req, res) {
  const userId = req.user.id;
  const sessions = await Session.findAll({
    where: {
      userId,
    },
  });

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

export async function getUser(req, res) {
  const { id } = req.params;
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
      user: {
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

export async function getCurrentUserInvites(req, res) {
  const userId = req.user.id;
  try {
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
