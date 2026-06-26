import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./src/routes/auth.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import eventRoutes from "./src/routes/event.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import sitemapRouter from "./src/routes/sitemap.js";
const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:8081";

app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(sitemapRouter);
app.use(helmet());
app.use(cookieParser());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use(morgan("dev"));

app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working",
  });
});

export default app;
