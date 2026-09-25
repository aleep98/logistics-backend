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

console.log("CORS_ORIGINS:", process.env.CORS_ORIGINS);

const app = express();

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
];

const allowedOrigins = (process.env.CORS_ORIGINS ?? defaultAllowedOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    const isTrustedLocalOrigin = isLocalhost && (url.protocol === "http:" || url.protocol === "https:");

    if (isTrustedLocalOrigin) {
      return true;
    }
  } catch {
    // Ignore invalid origins; they are rejected below.
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, origin ?? true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

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