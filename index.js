import app from "./app.js";
import { sequelize } from "./config/db.config.js";

async function main() {
  await sequelize.sync({force: false});
  app.listen(8080);
  console.log("Server on port 8080");
}

main();