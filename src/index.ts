import express from "express";
import dotenv from "dotenv";
import testRoute from "./Routes/TestRoute";
import { scrapeData } from "./script";

dotenv.config();

const app = express();

app.use("/api", testRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

setInterval(scrapeData, 300000);
scrapeData();
