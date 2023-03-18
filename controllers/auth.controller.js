import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { signJWT } from "../utils/jwt.utils.js";

export async function signUp(req, res) {
  try {
    User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    res.status(201).send({ message: "User is successfully created." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

export async function createSession(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user || bcrypt.compareSync(password, user.password) === false) {
    return res.status(401).send("Invalid email or password");
  }

  const session = await Session.create({
    userId: user.id,
  });

  // create access token
  const accessToken = signJWT(
    { email: user.email, name: user.name, sessionId: session.id },
    "4h"
  );

  const refreshToken = signJWT({ sessionId: session.id }, "1y");

  // set access token in cookie
  res.cookie("accessToken", accessToken, {
    maxAge: 14400000, // 5 minutes
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 3.154e10, // 1 year
    httpOnly: true,
  });

  // send user back
  return res.send(session);
}

export async function getSession(sessionId) {
  const session = Session.findOne({
    where: {
      sessionId: sessionId,
    },
  });

  return session && session.valid ? session : null;
}

export async function getSessionHandler(req, res) {
  return res.send(req.user);
}

// log out handler
export async function deleteSession(req, res) {
  res.cookie("accessToken", "", {
    maxAge: 0,
    httpOnly: true,
  });

  res.cookie("refreshToken", "", {
    maxAge: 0,
    httpOnly: true,
  });

  const session = Session.update({
    valid: false,
  });

  return res.send(session);
}
