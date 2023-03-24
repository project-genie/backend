import bcrypt from "bcryptjs";
import { User, UserCandidate } from "../models/user.model.js";
import { OrganizationMembers } from "../models/organization.model.js";
import { ProjectMembers } from "../models/project.model.js";
import { Session } from "../models/session.model.js";
import { signJWT } from "../utils/jwt.utils.js";
import { v4 as uuidv4 } from "uuid";
import sgMail from "@sendgrid/mail";
import envConfig from "../config/env.config.js";

/*
 * Sign Up.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function signUp(req, res) {
  try {
    const userCandidate = await UserCandidate.findOne({
      where: { email: req.body.email },
    });

    if (
      !userCandidate ||
      userCandidate.status !== "pending" ||
      userCandidate.secret !== req.body.secret
    ) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or secret",
      });
    }

    if (userCandidate.secret !== req.body.secret) {
      return res.status(401).send({
        success: false,
        message: "Invalid secret",
      });
    }

    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    await userCandidate.destroy();
    res
      .status(201)
      .send({ success: true, message: "User is successfully created." });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while creating the User.",
    });
  }
}

/*
 * Sign Up Candidate.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 *
 */
export async function signUpCandidate(req, res) {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });

    if (user) {
      return res.status(401).send({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const userCandidateSearch = await UserCandidate.findOne({
      where: { email: req.body.email },
    });

    if (userCandidateSearch) {
      await userCandidateSearch.destroy();
    }

    const secret = uuidv4();
    sgMail.setApiKey(envConfig.SENDGRID_KEY);

    const userCandidate = await UserCandidate.create({
      email: req.body.email,
      secret: secret,
    });

    // Send Mail with the link to continue.
    const msg = {
      to: req.body.email, // Change to your recipient
      from: "mertplayschess@outlook.com", // Change to your verified sender
      subject: "Project Genie User Registration",
      text:
        "Please follow the link below to continue to registration process: \n" +
        "http://localhost:3000/account/signup?secret=" +
        secret +
        "&email=" +
        req.body.email,
      html:
        "Please follow the link below to continue to registration process: \n" +
        "http://localhost:3000/account/signup?secret=" +
        secret +
        "&email=" +
        req.body.email +
        "\n" +
        "If you didn't register, please ignore this email.",
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(201).send({
      success: true,
      message: "Please check your email to continue sign up process.",
      data: userCandidate,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while creating the User.",
    });
  }
}

/*
 * Sign In.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 *
 */
export async function createSession(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user || bcrypt.compareSync(password, user.password) === false) {
    return res
      .status(401)
      .send({ success: false, message: "Invalid email or password" });
  }

  const session = await Session.create({
    userId: user.id,
  });

  // create access token
  const accessToken = signJWT(
    { id: user.id, email: user.email, name: user.name, sessionId: session.id },
    "15m"
  );

  const refreshToken = signJWT({ sessionId: session.id }, "1h");

  // set access token in cookie
  res.cookie("accessToken", accessToken, {
    maxAge: 900000, // 15 minutes
    httpOnly: true,
    // sameSite: "none",
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 3.6e6, // 8 hours
    httpOnly: true,
    // sameSite: "none",
  });

  // send user back
  return res.send(session);
}

/*
 * Get Session.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function getSession(sessionId) {
  const session = await Session.findOne({
    where: {
      id: sessionId,
    },
  });

  return session && session.valid ? session : null;
}

/*
 * Get Session handler.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export async function getSessionHandler(req, res) {
  return res.send(req.user);
}
