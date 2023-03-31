import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { User } from "./user.model.js";
import { Project } from "./project.model.js";

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
      allowNull: { args: false, msg: "Please enter organization description." },
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

// invites
export const Invite = sequelize.define(
  "invites",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter your organizationId." },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter your email address." },
      validate: {
        isEmail: { args: true, msg: "Please enter a valid email address." },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: { args: false, msg: "Please enter your userId." },
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter your secret." },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter your status." },
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Relationships
Organization.hasMany(OrganizationMembers, {
  foreignkey: "organizationId",
  sourceKey: "id",
});

Invite.belongsTo(Organization, {
  foreignKey: "organizationId",
  targetKey: "id",
});

Organization.hasMany(Project, {
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
