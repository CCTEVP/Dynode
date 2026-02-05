import express, { Request, Response, NextFunction } from "express";
import creativesRouter from "./creatives/default";
import componentsRouter from "./components/default";
import elementsRouter from "./elements/default";
import codebaseRouter from "./codebase/default";
import usersRouter from "./users/default";
import sourcesRouter from "./sources/default";
import assetsRouter from "./assets/default";
import foldersRouter from "./folders/default";
import logger from "../../services/logger";

const router = express.Router();
router.use("/elements", elementsRouter);
router.use("/creatives", creativesRouter);
router.use("/components", componentsRouter);
router.use("/codebase", codebaseRouter);
router.use("/users", usersRouter);
router.use("/sources", sourcesRouter);
router.use("/assets", assetsRouter);
router.use("/folders", foldersRouter);

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.json({
    message: "Welcome to the Data endpoint! Try /data/creatives",
  });
});

export default router;
