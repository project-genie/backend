export function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(403).send("Invalid session");
  }

  return next();
}
