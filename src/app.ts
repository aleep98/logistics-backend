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

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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