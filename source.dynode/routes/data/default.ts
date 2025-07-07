import express, { Request, Response, NextFunction } from "express";
const router = express.Router();

import creativesRouter from "./creatives/default";
router.use("/creatives", creativesRouter);

import usersRouter from "./users/default";
router.use("/users", usersRouter);

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.json({
    message: "Welcome to the Data endpoint! Try /data/creatives",
  });
});

export default router;
