import express, { type Request, type Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({
    state: "ok",
    server: "Online",
  });
});

app.use(errorHandler);

export default app;
