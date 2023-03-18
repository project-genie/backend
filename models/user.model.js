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
    password: {
      type: DataTypes.STRING,
      allowNull: { args: false, msg: "Please enter your password." },
    },
  },
  {
    timestamps: true,
  }
);
