import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/errormiddleware";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use(errorMiddleware);



export default app;