import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

export const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Name is required",
      },
      min: {
        args: [3],
        msg: "Name must be at least 3 characters long",
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      notEmpty: {
        msg: "Email is required",
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: "Password is required",
      },
      min: {
        args: [8],
        msg: "Password must be at least 8 characters long",
      },
    },
  },
});
