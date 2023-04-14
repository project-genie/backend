import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import requireUser from "./middleware/requireUser.js";
import deserializeUser from "./middleware/deserializeUser.js";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// This middleware will allow us to make requests from the frontend to the backend.
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// This middleware will log the requests to the console.
app.use(morgan("dev"));

// This middleware will help us to parse the cookies.
app.use(cookieParser());

// This middleware will help us to parse the body of the request.
app.use(express.json());

// This route does not require a user to be logged in.
//So It won't use cookies because it is before "deserializeUser" middleware.
app.use("/api/auth", authRoutes);
// This middleware will check if the user is logged in.
// If not, it will send a 401 error. If yes, it will add the user to the request object.
app.use(deserializeUser);

// All the routes below this middleware will require a user to be logged in.
app.use("/api/users", requireUser, userRoutes);
app.use("/api/organizations", requireUser, organizationRoutes);
app.use("/api/projects", requireUser, projectRoutes);
app.use("/api/tasks", requireUser, taskRoutes);

export default app;
