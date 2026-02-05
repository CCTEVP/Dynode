import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

declare module "express-serve-static-core" {
  interface Request {
    user?: any; // Or define a more specific type if you want
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, (config.jwtSecret as string) || "", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // user contains userId and username
    next();
  });
}
