import { signJWT, verifyJWT } from "../utils/jwt.utils.js";
import { getSession } from "../controllers/auth.controller.js";

export default async function deserializeUser(req, res, next) {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    return next();
  }
  const { payload: user, expired } = verifyJWT(accessToken);

  if (user) {
    req.user = user;
    return next();
  }

  console.log("expired: ", expired);
  // expired but valid access token
  const { payload: refresh } =
    expired && refreshToken ? verifyJWT(refreshToken) : { payload: null };
  if (!refresh) {
    return next();
  }

  const session = await getSession(refresh.sessionId);
  if (!session) {
    return next();
  }

  const newAccessToken = signJWT(session, "15m");

  res.cookie("accessToken", newAccessToken, {
    maxAge: 900000, // 15 minutes
    httpOnly: true,
    // sameSite: "none",
  });

  req.user = verifyJWT(newAccessToken).payload;

  return next();
}
