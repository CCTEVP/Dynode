import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
import bcrypt from "bcrypt";
import User from "../../models/User";

const router = express.Router();

router.post("/create", async (req: Request, res: Response) => {
  const { username, password, name } = req.body;
  const editorUserId = req.user?.userId || "000000000000000000000000"; // The logged-in user making the change
  if (!username || !password || !name) {
    res.status(400).json({ message: "Username, password, and name required" });
    return;
  }
  try {
    const existing = await User.findOne({ username }).exec();
    if (existing) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }
    const now = new Date();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      name,
      created: now,
      updated: now,
      changes: [
        {
          timestamp: now,
          user: editorUserId,
          newValue: "New user registration",
        },
      ],
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err });
  }
});

// Password reset endpoint (authenticated)
router.patch("/reset/:id", async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  const editorUserId = req.user?.userId || "000000000000000000000000"; // The logged-in user making the change
  const userId = req.params.id; // The user being edited
  if (!newPassword) {
    res.status(400).json({ message: "New Password required" });
    return;
  }

  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const oldPassword = user.password;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updated = new Date();
    user.changes.push({
      timestamp: new Date(),
      user: editorUserId,
      oldValue: oldPassword,
      newValue: hashedPassword,
    });
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err });
  }
});

// Edit user endpoint (authenticated)
router.put("/edit/:id", async (req: Request, res: Response) => {
  const editorUserId = req.user?.userId || "000000000000000000000000"; // The logged-in user making the change
  const userId = req.params.id; // The user being edited
  const updates = req.body;

  if (!userId || Object.keys(updates).length === 0) {
    res.status(400).json({
      message: "User ID and at least one field to update are required",
    });
    return;
  }

  try {
    const user = await User.findById(userId).exec(); // Find the user to edit
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Collect all changes
    const oldValue: Record<string, any> = {};
    const newValue: Record<string, any> = {};
    let changed = false;

    for (const key of Object.keys(updates)) {
      if (user[key] !== undefined && user[key] !== updates[key]) {
        oldValue[key] = user[key];
        newValue[key] = updates[key];
        user[key] = updates[key];
        changed = true;
      }
    }

    if (changed) {
      user.updated = new Date();
      user.changes.push({
        timestamp: new Date(),
        user: editorUserId, // The logged-in user making the change
        oldValue,
        newValue,
      });
      await user.save();
      res.json({ message: "User updated successfully" });
    } else {
      res.status(400).json({ message: "No valid fields changed" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err });
  }
});

export default router;
