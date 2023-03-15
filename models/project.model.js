import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { Task } from "./task.model.js";

export const Project = sequelize.define(
  "projects",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    priority: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.STRING,
    },
    deliverydate: {
      type: DataTypes.DATE,
    }
  },
  {
    timestamps: false,
  }
);

Project.hasMany(Task, {
  foreinkey: "projectId",
  sourceKey: "id",
});

Task.belongsTo(Project, { foreinkey: "projectId", targetId: "id" });