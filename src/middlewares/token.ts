import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = (roles: string[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("ERROR: JWT_SECRET is not defined.");
      return res.status(500).json({
        error: "Internal server error. Incomplete configuration.",
      });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
        role: string;
      };

      req.user = decoded;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          error: "Access forbidden. You do not have permission.",
        });
      }

      return next();
    } catch (error) {
      if ((error as any)?.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired.",
        });
      }

      return res.status(401).json({
        error: "Invalid token.",
      });
    }
  };
};