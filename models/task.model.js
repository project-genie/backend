import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { User } from "./user.model.js";

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
    },
    projectId: {
      type: DataTypes.INTEGER,
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
    exception: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(
        "backlog",
        "todo",
        "in-progress",
        "done",
        "completed"
      ),
      defaultValue: "backlog",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter task difficulty." },
      defaultValue: 3,
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    started_date: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
  }
);

export const CompletedTask = sequelize.define(
  "completed_tasks",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter task id." },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter completed by." },
    },
    started_date: {
      type: DataTypes.DATE,
    },
    completed_date: {
      type: DataTypes.DATE,
    },
    hours: {
      type: DataTypes.INTEGER,
    },
    user_level: {
      type: DataTypes.INTEGER,
    },
    task_difficulty: {
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

CompletedTask.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

CompletedTask.belongsTo(Task, {
  foreignKey: "task_id",
  targetKey: "id",
});
