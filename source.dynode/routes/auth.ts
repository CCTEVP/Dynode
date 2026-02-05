import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/collections/UsersCollection";
import logger from "../services/logger";
import config from "../config";

const router = express.Router();

// Store verification codes temporarily (in production, use Redis or similar)
const verificationCodes = new Map<
  string,
  { code: string; expires: Date; attempts: number }
>();

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [email, data] of verificationCodes.entries()) {
    if (data.expires < now) {
      verificationCodes.delete(email);
    }
  }
}, 5 * 60 * 1000);

// Generate random 6-digit code
function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Send email (mock implementation - replace with actual email service)
async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  try {
    // TODO: Implement actual email sending with your email service
    // For now, just log the code (for development only)
    console.log("\n" + "=".repeat(50));
    console.log(`🔐 VERIFICATION CODE for ${email}`);
    console.log(`📧 Code: ${code}`);
    console.log("=".repeat(50) + "\n");

    logger.info(`Verification code for ${email}: ${code}`);

    // In production, replace this with actual email sending:
    // await emailService.send({
    //   to: email,
    //   subject: 'Your DYNODE Verification Code',
    //   text: `Your verification code is: ${code}`,
    //   html: `<p>Your verification code is: <strong>${code}</strong></p>`
    // });

    return true;
  } catch (error) {
    logger.error("Failed to send verification email:", error);
    return false;
  }
}

// Check email and send verification code
router.post("/check-email", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    res.status(400).json({
      success: false,
      message: "Valid email address required",
    });
    return;
  }

  try {
    // Check if user exists in database
    const user = await User.findOne({ username: email }).exec();

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Email not found. Please contact an administrator for access.",
      });
      return;
    }

    // Generate and store verification code
    const code = generateVerificationCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    verificationCodes.set(email, {
      code,
      expires,
      attempts: 0,
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, code);

    if (!emailSent) {
      res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
      return;
    }

    logger.info(`Verification code sent to ${email}`);
    res.json({
      success: true,
      message: "Verification code sent to your email address.",
      requiresVerification: true,
    });
    return;
  } catch (error) {
    logger.error("Error in check-email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
});

// Verify code and authenticate
router.post("/verify-code", async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({
      success: false,
      message: "Email and verification code required",
    });
    return;
  }

  if (code.length !== 6 || !/^\d+$/.test(code)) {
    res.status(400).json({
      success: false,
      message: "Invalid verification code format",
    });
    return;
  }

  try {
    const storedData = verificationCodes.get(email);

    if (!storedData) {
      res.status(404).json({
        success: false,
        message: "No verification code found. Please request a new one.",
      });
      return;
    }

    // Check if code expired
    if (storedData.expires < new Date()) {
      verificationCodes.delete(email);
      res.status(410).json({
        success: false,
        message: "Verification code expired. Please request a new one.",
      });
      return;
    }

    // Check attempt limit
    if (storedData.attempts >= 3) {
      verificationCodes.delete(email);
      res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new code.",
      });
      return;
    }

    // Verify code
    if (storedData.code !== code) {
      storedData.attempts++;
      verificationCodes.set(email, storedData);

      res.status(401).json({
        success: false,
        message: `Invalid verification code. ${
          3 - storedData.attempts
        } attempts remaining.`,
      });
      return;
    }

    // Code is valid, get user and generate JWT
    const user = await User.findOne({ username: email }).exec();

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: user.username,
        userId: user._id,
        name: user.name,
        domains: user.domains || [],
      },
      (config.jwtSecret as string) || "",
      { expiresIn: "24h" }
    );

    // Clean up verification code
    verificationCodes.delete(email);

    logger.info(`User ${email} authenticated successfully`);
    res.json({
      success: true,
      message: "Authentication successful",
      token,
    });
    return;
  } catch (error) {
    logger.error("Error in verify-code:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
});

// Get current user info (protected route)
router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "No token provided",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      (config.jwtSecret as string) || ""
    ) as any;
    // Populate domains so the /me response returns domain ids (or documents if available)
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("domains")
      .exec();

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        created: user.created,
        domains: user.domains || [],
      },
    });
    return;
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
});

export default router;
