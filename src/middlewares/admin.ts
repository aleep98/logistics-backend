import User from "../models/User.js";
import { authMiddleware, AuthRequest } from "./token.js";
import { asyncHandler } from "./asyncHandler.js";

// Verify the signed token and the current role in the database.
export const requireAdmin = [
  authMiddleware(["admin"]),
  asyncHandler(async (req: AuthRequest, res, next) => {
    const user = await User.findById(req.user?.id).select("role");
    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Administrator access required." });
    }
    next();
  }),
];

