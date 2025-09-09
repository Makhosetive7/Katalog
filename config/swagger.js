import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Katalog API",
      version: "1.0.0",
      description:
        "API for tracking books, games, movies, and TV shows and etc",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["../routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger docs available at http://localhost:3000/api-docs");
};

export default swaggerDocs;
