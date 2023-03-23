import { signJWT, verifyJWT } from "../utils/jwt.utils.js";
import { getSession } from "../controllers/auth.controller.js";

export default function deserializeUser(req, res, next) {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    return next();
  }
  const { payload: user, expired } = verifyJWT(accessToken);

  if (user) {
    req.user = user;
    return next();
  }

  // expired but valid access token
  const { payload: refresh } =
    expired && refreshToken ? verifyJWT(refreshToken) : { payload: null };

  if (!refresh) {
    return next();
  }

  const session = getSession(refresh.sessionId);

  if (!session) {
    return next();
  }

  const newAccessToken = signJWT(session, "15m");

  res.cookie("accessToken", newAccessToken, {
    maxAge: 14400000, // 4 hours
    httpOnly: true,
    // sameSite: "none",
  });

  req.user = verifyJWT(newAccessToken).payload;

  return next();
}
