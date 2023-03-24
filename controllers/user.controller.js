import { Session } from "../models/session.model.js";

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
