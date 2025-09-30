import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "E-mail already registered" });
    }

    // Public registration only allows creating 'driver' users.
    // Admins can create users with other roles via the POST /api/users route.

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hash, role: "driver" });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
}));

router.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // A JWT_SECRET agora é validada na inicialização da aplicação (ex: no server.ts).
    // Portanto, podemos usá-la com segurança, sabendo que ela existe.
    const jwtSecret = process.env.JWT_SECRET;

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret!, { expiresIn: "8h" });
    res.json({
        message: "Login successful!",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
     });
}));

export default router;