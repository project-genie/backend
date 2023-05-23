import bcrypt from "bcryptjs";
import { User, UserCandidate } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { signJWT } from "../utils/jwt.utils.js";
import { v4 as uuidv4 } from "uuid";
import sgMail from "@sendgrid/mail";
import envConfig from "../config/env.config.js";

/*
 * Sign Up.
 * @param {Request} {body: {name, email, secret, password}}
 * @param {Response} {success, message}
 * @returns {Promise<Response>}
 */
export async function signUp(req, res) {
  // Get the parameters from the request.
  const { name, email, secret, password } = req.body;

  try {
    // Check if the user candidate exists.
    const userCandidate = await UserCandidate.findOne({
      where: { email },
    });

    if (
      !userCandidate ||
      userCandidate.status !== "pending" ||
      userCandidate.secret !== secret
    ) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or secret",
      });
    }

    if (userCandidate.secret !== secret) {
      return res.status(401).send({
        success: false,
        message: "Invalid secret",
      });
    }
    // Create the user
    await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, 8),
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
 * @param {Request} {body: {email}}
 * @param {Response} {success, message}
 * @returns {Promise<Response>}
 */
export async function signUpCandidate(req, res) {
  // Get the parameters from the request.
  const { email } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({
      where: { email },
    });

    if (user) {
      return res.status(401).send({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Check if the user candidate exists.
    const userCandidateSearch = await UserCandidate.findOne({
      where: { email },
    });

    if (userCandidateSearch) {
      await userCandidateSearch.destroy();
    }

    const secret = uuidv4();
    sgMail.setApiKey(envConfig.SENDGRID_KEY);

    const userCandidate = await UserCandidate.create({
      email,
      secret: secret,
    });

    // Send Mail with the link to continue.
    const msg = {
      to: email, // Change to your recipient
      from: "mertplayschess@outlook.com", // Change to your verified sender
      subject: "Project Genie User Registration",
      html: `
        <table
          role="presentation"
          style="width:602px;border-collapse:collapse;text-align:left;"
        >
          <tr>
            <td style="padding:0;">
              <h2>Welcome to Project Genie!</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              Please <a href="${envConfig.FRONTEND_URL}/account/signup?secret=${secret}&email=${email}">
              Click here</a> to continue to registration process. If you didn't register, please ignore this email.
            </td>
          </tr>
        </table>`,
    };

    sgMail
      .send(msg)
      .then((res) => {
        console.log("Res: ", res);
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
 * @param {Request} {body: {email, password}}
 * @param {Response} {success, message}
 * @returns {Promise<Response>}
 *
 */
export async function createSession(req, res) {
  // Get the parameters from the request.
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
