export default function requireUser(req, res, next) {
  console.log("req.user", req.user);
  if (!req.user) {
    return res.status(403).send("Invalid session");
  }

  return next();
}
