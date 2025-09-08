import express from "express";


const app = express();
app.use(express.json());

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

export default app;