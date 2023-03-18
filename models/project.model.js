import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { User } from "./user.model.js";
import { Task } from "./task.model.js";

// projects
export const Project = sequelize.define(
  "projects",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter organization id." },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter project name." },
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  }
);

// project_members
export const ProjectMembers = sequelize.define("project_members", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: { args: false, msg: "Please enter project id." },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: { args: false, msg: "Please enter user id." },
  },
  role: {
    type: DataTypes.STRING,
    allowNull: { args: false, msg: "Please enter role." },
  },
});

// Relationships
Project.hasMany(ProjectMembers, {
  foreignkey: "projectId",
  sourceKey: "id",
});

Project.hasMany(Task, {
  foreignkey: "projectId",
  sourceKey: "id",
});

ProjectMembers.belongsTo(Project, {
  foreignKey: "projectId",
  targetKey: "id",
});

ProjectMembers.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});
