import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/collections/UsersCollection";
import config from "../config";

const router = express.Router();

// Traditional username/password login
router.post("/", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Check if this is a traditional login request
  if (username && password) {
    try {
      const user = await User.findOne({ username }).exec();
      if (user && (await bcrypt.compare(password, user.password))) {
        // Password is correct, generate JWT
        const token = jwt.sign(
          { username: user.username, userId: user._id, name: user.name },
          (config.jwtSecret as string) || "",
          { expiresIn: "1d" }
        );
        res.json({ token });
        return;
      }
      res.status(401).json({ message: "Invalid credentials" });
      return;
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }

  // If no username/password provided, return error
  res.status(400).json({ message: "Username and password required" });
});

export default router;
