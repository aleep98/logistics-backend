import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authMiddleware = (roles: string[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("ERROR: JWT_SECRET environment variable is not defined.");
        return res.status(500).json({ error: "Internal server error. Incomplete configuration." });
      }

      const decoded = jwt.verify(token, jwtSecret) as { id: string; role: string };
      req.user = decoded;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Access forbidden. You do not have permission." });
      }

      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token." });
    }
  };
};