import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";
import chalk from "chalk";

const PORT = Number(process.env.PORT ?? 3000);
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI?.trim()) {
  console.error("ERROR: MONGO_URI is not defined in the .env file.");
  process.exit(1);
}

if (!JWT_SECRET?.trim()) {
  console.error("ERROR: JWT_SECRET is not defined in the .env file.");
  process.exit(1);
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error("ERROR: PORT must be an integer between 1 and 65535.");
  process.exit(1);
}

async function startServer(mongoUri: string): Promise<void> {
  try {
    await mongoose.connect(mongoUri);
    console.log(chalk.blue("Successfully connected to MongoDB!"));

    const server = app.listen(PORT, () => {
      console.log(chalk.green(`Server is running on port ${PORT}`));
    });

    server.on("error", (err: Error) => {
      console.error("Error starting HTTP server:", err.message);
      process.exit(1);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error starting application:", message);
    process.exit(1);
  }
}

void startServer(MONGO_URI);