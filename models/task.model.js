import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { User } from "./user.model.js";

export const Status = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
  COMPLETED: "completed",
};

// tasks
export const Task = sequelize.define(
  "tasks",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter project id." },
    },
    assigneeId: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter task name." },
    },
    description: {
      type: DataTypes.STRING,
    },
    exception: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("backlog", "todo", "in-progress", "completed"),
      allowNull: { args: false, msg: "Please enter task status." },
      defaultValue: "backlog",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: { args: false, msg: "Please enter task priority." },
      defaultValue: "medium",
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter task difficulty." },
      defaultValue: 5,
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    started_date: {
      type: DataTypes.DATE,
    },
    predicted_completion_date: {
      type: DataTypes.DATE,
    },
    predicted_work_hours: {
      type: DataTypes.INTEGER,
    },
    sprint: {
      type: DataTypes.INTEGER,
    },
    sprint_requirement: {
      type: DataTypes.INTEGER,
    },
    waterfall_requirement: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false,
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
