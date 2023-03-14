import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME, // db name,
  process.env.DB_USERNAME, // username
  process.env.DB_PASSWORD, // password
  {
    host: "localhost",
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