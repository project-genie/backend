import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { Project } from "./project.model.js";

export const Organization = sequelize.define(
  "organizations",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  }
);

Organization.hasMany(Project, {
  foreignkey: "organizationId",
  sourceKey: "id",
});
