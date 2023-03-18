export default function requireUser(req, res, next) {
  if (!req.user) {
    return res
      .status(403)
      .send({ success: false, message: "You are not authenticated." });
  }

  return next();
}
