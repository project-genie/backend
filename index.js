import app from "./app.js";
import { sequelize } from "./config/db.config.js";

async function main() {
  // Sync the database.
  await sequelize.sync({ force: false });

  // Start the server.
  app.listen(8080);
  console.log("Server on port 8080");
}

// Call the main function.
main();
