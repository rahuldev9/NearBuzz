import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./src/routes/auth.routes.js";

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(helmet());

app.use(
  cors({
    origin: corsOrigin,
  }),
);

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working",
  });
});
export default app;
