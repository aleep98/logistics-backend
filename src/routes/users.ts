import { Router } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/User.js";
import { authMiddleware, AuthRequest } from "../middlewares/token.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.post(
  "/",
  authMiddleware(["admin"]),
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: "Name, email, password, and role are required.",
      });
    }

    const allowedRoles: IUser["role"][] = ["admin", "dispatcher", "driver"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${allowedRoles.join(", ")}`,
      });
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters long.",
      });
    }

    if (typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        error: "A valid email is required.",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hash,
      role,
    });

    await user.save();

    const { passwordHash, ...userWithoutPassword } = user.toObject();

    return res.status(201).json(userWithoutPassword);
  })
);

router.get(
  "/",
  authMiddleware(["admin", "dispatcher"]),
  asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-passwordHash");
    return res.status(200).json(users);
  })
);

router.delete(
  "/:id",
  authMiddleware(["admin"]),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (id === adminId) {
      return res.status(403).json({ error: "Admins cannot delete their own account." });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const { passwordHash, ...userWithoutPassword } = deletedUser.toObject();

    return res.status(200).json(userWithoutPassword);
  })
);

export default router;

