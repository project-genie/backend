import { signJWT, verifyJWT } from "../utils/jwt.utils.js";
import { getSession } from "../controllers/auth.controller.js";
import { User } from "../models/user.model.js";

export default async function deserializeUser(req, res, next) {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    if (!refreshToken) {
      return next();
    }

    const { payload: refresh } = verifyJWT(refreshToken);
    if (!refresh) {
      return next();
    }

    const session = await getSession(refresh.sessionId);

    if (!session) {
      return next();
    }
    const user = await User.findByPk(session.userId);

    const newAccessToken = signJWT(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        sessionId: session.id,
      },
      "10s"
    );

    res.cookie("accessToken", newAccessToken, {
      maxAge: 10000, // 15 minutes
      httpOnly: true,
      // sameSite: "none",
    });

    req.user = verifyJWT(newAccessToken).payload;
  }

  const { payload: user, expired } = verifyJWT(accessToken);

  if (user) {
    req.user = user;
    return next();
  }

  return next();
}
