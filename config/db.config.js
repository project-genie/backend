import Sequelize from "sequelize";
import config from "./env.config.js";

export const sequelize = new Sequelize(
  config.DB_NAME, // db name,
  config.DB_USERNAME, // username
  config.DB_PASSWORD, // password
  {
    host: config.DB_HOST,
    dialect: "postgres",
    // pool: {
    //   max: 5,
    //   min: 0,
    //   require: 30000,
    //   idle: 10000,
    // },
    // logging: false,
  }
);