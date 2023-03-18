import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// Import routes
import authRoutes from "./routes/auth.routes.js";

import organizationRoutes from "./routes/organization.routes.js";

import requireUser from "./middleware/requireUser.js";
import deserializeUser from "./middleware/deserializeUser.js";

// Middlewares
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use(deserializeUser);

app.use("/api/organizations", requireUser, organizationRoutes);

export default app;
