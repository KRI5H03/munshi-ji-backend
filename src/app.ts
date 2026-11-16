import express, { type Request, type Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization", "X-Business-Id"],
  }),
);
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({
    state: "ok",
    server: "Online",
  });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `No route for ${req.method} ${req.path}`,
    },
  });
});

app.use(errorHandler);

export default app;
