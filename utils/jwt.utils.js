import config from "../config/env.config.js";
import jwt from "jsonwebtoken";

// sign jwt
export function signJWT(payload, expiresIn) {
  return jwt.sign(payload, config.PRIVATE_KEY, {
    expiresIn,
  });
}

// verify jwt
export function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, config.PUBLIC_KEY);
    return { payload: decoded, expired: false };
  } catch (error) {
    return { payload: null, expired: error.message.includes("jwt expired") };
  }
}
