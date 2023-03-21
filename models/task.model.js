import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { User } from "./user.model.js";
import { Project } from "./project.model.js";

// tasks
export const Task = sequelize.define(
  "tasks",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter created by." },
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter project id." },
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter task assigned to." },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter task name." },
    },
    description: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM("backlog", "todo", "in-progress", "done"),
      allowNull: { args: false, msg: "Please enter task status." },
      defaultValue: "backlog",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: { args: false, msg: "Please enter task priority." },
      defaultValue: "medium",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: { args: false, msg: "Please enter task due date." },
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter task difficulty." },
      defaultValue: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Relationships
Task.belongsTo(User, {
  foreignKey: "assigneeId",
  targetKey: "id",
});

Task.belongsTo(User, {
  foreignKey: "createdBy",
  targetKey: "id",
});

Task.belongsTo(Project, {
  foreignKey: "projectId",
  targetKey: "id",
});
