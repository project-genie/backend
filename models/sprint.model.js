import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

export const Sprint = sequelize.define("sprints", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: { args: false, msg: "Please enter project id." },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: { args: false, msg: "Please enter sprint name." },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: { args: false, msg: "Please enter sprint description." },
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  phase: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
  },
});

export const SprintRequirements = sequelize.define("sprint_requirements", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sprintId: {
    type: DataTypes.INTEGER,
    allowNull: { args: false, msg: "Please enter sprint id." },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: { args: false, msg: "Please enter requirement name." },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: { args: false, msg: "Please enter requirement description." },
  },
});

Sprint.hasMany(SprintRequirements, {
  foreignKey: "sprintId",
  sourceKey: "id",
});
