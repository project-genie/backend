import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// Import routes
import authRoutes from "./routes/auth.routes.js";

import organizationRoutes from "./routes/organization.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";

import requireUser from "./middleware/requireUser.js";
import deserializeUser from "./middleware/deserializeUser.js";
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middlewares
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use(deserializeUser);

app.use("/api/users", requireUser, userRoutes);
app.use("/api/organizations", requireUser, organizationRoutes);
app.use("/api/projects", requireUser, projectRoutes);
app.use("/api/tasks", requireUser, taskRoutes);

export default app;
