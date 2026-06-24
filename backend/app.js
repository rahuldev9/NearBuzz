import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./src/routes/auth.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import eventRoutes from "./src/routes/event.routes.js";
const app = express();
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:8081";

app.use(helmet());

const corsOptions = {
  origin: corsOrigin === "*" ? true : corsOrigin,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working",
  });
});
export default app;
