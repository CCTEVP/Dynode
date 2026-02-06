import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// Extend Express Request interface to include session tracking
declare module "express-serve-static-core" {
  interface Request {
    sessionId?: string;
    logContext?: {
      sessionId: string;
      userId?: string;
    };
  }
}

/**
 * Session middleware that generates a unique session ID for each request
 * and extracts user information for logging purposes.
 */
export function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Generate unique session ID for this request
  const sessionId = uuidv4();
  req.sessionId = sessionId;

  // Extract userId from authenticated user (if available)
  const userId = req.user?.userId;

  // Create log context for easy access in logging
  req.logContext = {
    sessionId,
    userId,
  };

  next();
}
