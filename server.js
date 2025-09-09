import express from "express";
import app from "./app.js";
import swaggerDocs from "./config/swagger.js";

const server = express();
swaggerDocs(app);
const PORT = process.env.PORT || 5000;

server.use(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
