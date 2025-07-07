import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      // Password is correct, generate JWT
      const token = jwt.sign(
        { username: user.username, userId: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );
      res.json({ token });
      return;
    }
    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
