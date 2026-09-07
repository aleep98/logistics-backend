import { Request, Response, NextFunction } from "express";

interface HttpError extends Error {
  statusCode?: number;
  code?: number;
  path?: string;
  kind?: string;
}

export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("GLOBAL ERROR HANDLER:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: `Invalid format for field '${err.path}'. Expected a ${err.kind}.`,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token." });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired." });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "A resource with this value already exists." });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode < 500 ? err.message : "An unexpected internal server error occurred.";

  return res.status(statusCode).json({ error: message });
};