import { requireAdmin } from "./middlewares/admin.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import shipmentRoutes from "./routes/shipment.js";
import userRoutes from "./routes/users.js";
import vehicleRoutes from "./routes/vehicles.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
  "https://logistics-frontend-1-3r5q.onrender.com",
];

const allowedOrigins = (process.env.CORS_ORIGINS ?? defaultAllowedOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Requests without Origin (health checks, CLI clients) are not browser CORS requests.
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.get("/api/admin/session", ...requireAdmin, (_req, res) => { res.sendStatus(204); });
app.use("/api/users", ...requireAdmin, userRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.get("/", (_, res) => {
  res.send("Hello World");
});

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(globalErrorHandler);

export default app;
