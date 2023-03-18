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
    description: {
      type: DataTypes.STRING,
    },
    deliveryDate: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
  }
);

Project.hasMany(Task, {
  foreignkey: "projectId",
  sourceKey: "id",
});

Task.belongsTo(Project, { foreinkey: "projectId", targetId: "id" });
