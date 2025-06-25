import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
import axios from "axios";
const router = express.Router();

router.get(
  "/:id",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`Dynamics loaded`);
      const creativeId = req.params.id;
      if (!creativeId) {
        logger.error("Creative ID is required");
        res.render("error", {
          message: "Creative ID is required",
          error: { status: 400, stack: "Creative ID is required" },
        });
        //res.status(400).send("Creative ID is required");
        return;
      }
      // Replace with your actual API endpoint
      const apiRes = await axios.get(
        "https://localhost:3000/data/creatives/" + creativeId,
        {
          // For self-signed certs in development only:
          httpsAgent: new (require("https").Agent)({
            rejectUnauthorized: false,
          }),
        }
      );
      const content = apiRes.data; // Adjust this if your API response structure is different
      res.render("dynamic", { content: content });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
