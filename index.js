import app from "./app.js";
import { sequelize } from "./database/database.js";

async function main() {
  await sequelize.sync({force: false});
  app.listen(8080);
  console.log("Server on port 8080");
}

main();