import express from "express";
import morgan from "morgan";

const app = express();

// Import routes
import authRoutes from "./routes/auth.routes.js";

import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";

import deserializeUser from "./middleware/deserializeUser.js";

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use(deserializeUser);

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

export default app;
