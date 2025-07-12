import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "sql12789615",
  process.env.DB_USER || "sql12789615",
  process.env.DB_PASSWORD || "flTGHndkAp",
  {
    host: process.env.DB_HOST || "sql12.freesqldatabase.com",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize; 