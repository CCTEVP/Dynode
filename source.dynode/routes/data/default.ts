import express, { Request, Response, NextFunction } from "express";
import creativesRouter from "./creatives/default";
import componentsRouter from "./components/default";
import elementsRouter from "./elements/default";
import logger from "../../services/logger";

const router = express.Router();
router.use("/elements", elementsRouter);
router.use("/creatives", creativesRouter);
router.use("/components", componentsRouter);

import usersRouter from "./users/default";
router.use("/users", usersRouter);

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.json({
    message: "Welcome to the Data endpoint! Try /data/creatives",
  });
});

export default router;
