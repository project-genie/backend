import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

export const Waterfall = sequelize.define("waterfalls", {
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

export const WaterfallRequirements = sequelize.define(
  "waterfall_requirements",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    waterfallId: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter waterfall id." },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter requirement name." },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter requirement description." },
    },
    status: {
      type: DataTypes.STRING,
    },
  }
);

Waterfall.hasMany(WaterfallRequirements, {
  foreignKey: "waterfallId",
  sourceKey: "id",
});
