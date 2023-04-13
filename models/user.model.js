import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

export const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter your name." },
      unique: { args: true, msg: "Email already exists." },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter your email address." },
      validate: {
        isEmail: { args: true, msg: "Please enter a valid email address." },
      },
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter your password." },
    },
  },
  {
    timestamps: false,
  }
);

export const UserCandidate = sequelize.define(
  "user_candidates",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter your email address." },
      validate: {
        isEmail: { args: true, msg: "Please enter a valid email address." },
      },
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
    timestamps: false,
  }
);
