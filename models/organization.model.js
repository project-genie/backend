import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { User } from "./user.model.js";

// organizations
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
      allowNull: { args: false, msg: "Please enter organization name." },
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  }
);

// organization_members
export const OrganizationMembers = sequelize.define("organization_members", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: { args: false, msg: "Please enter organization id." },
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
Organization.hasMany(OrganizationMembers, {
  foreignkey: "organizationId",
  sourceKey: "id",
});

OrganizationMembers.belongsTo(Organization, {
  foreignKey: "organizationId",
  targetKey: "id",
});

OrganizationMembers.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});
