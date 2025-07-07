import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
import scrapper from "../../services/scrapper";
import bundler from "../../services/bundler";
import caching from "../../services/caching";
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
        return;
      }
      const apiRes = await axios.get(
        "https://localhost:3000/data/creatives/" + creativeId,
        {
          httpsAgent: new (require("https").Agent)({
            rejectUnauthorized: false,
          }),
        }
      );
      const content = apiRes.data;

      /////// Move scrapping logic to build.dynode, so it's only executed after every content update

      // Scrape components, animations, assets
      const { components, animations, assets } = await scrapper.getComponents(
        content
      );

      // Prepare resources object
      const now = new Date();
      const resources = {
        created: now,
        updated: now,
        components,
        animations,
        assets,
      };

      // Determine the correct POST URL based on the origin field
      const origin = content.origin || "creatives";
      const putUrl = `https://localhost:3000/data/creatives/${origin}/${creativeId}`;
      logger.info(`PUT URL: ${putUrl}`);
      // PUT to the API to update the creative with the new resources field
      await axios.put(
        putUrl,
        { resources: resources }, // send this as an object so it's added as a field with all the contents
        {
          httpsAgent: new (require("https").Agent)({
            rejectUnauthorized: false,
          }),
        }
      );

      const cache = await caching.cacheComponents(creativeId);

      /////// The content only needs to know which files are required in the HEAD and BODY

      res.render("dynamic", {
        content,
        elements: { components, animations, assets },
        manager: cache,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
