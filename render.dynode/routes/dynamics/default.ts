import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
import bundler from "../../services/bundler";
import caching from "../../services/caching";
import axios from "axios";
import { builtinModules } from "module";
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
        "http://localhost:3000/data/creatives/" + creativeId,
        {
          httpsAgent: new (require("https").Agent)({
            rejectUnauthorized: false,
          }),
        }
      );
      const content = apiRes.data;

      // Register assets to cache

      res.render("dynamic", {
        content,
      });
    } catch (err) {
      next(err);
    }
  }
);
router.get(
  "/:id/resources/:resource.:debug.:extension",
  async (req: Request, res: Response, next: NextFunction) => {
    const creativeId = req.params.id;
    const resource = req.params.resource;
    const debug = req.params.debug === "min";
    const extension = req.params.extension;
    // Map extensions to content types
    const CONTENT_TYPES: Record<string, string> = {
      js: "application/javascript",
      css: "text/css",
      json: "application/json",
      html: "text/html",
      txt: "text/plain",
    };
    const contentType =
      CONTENT_TYPES[extension.toLowerCase()] || "application/octet-stream";

    try {
      const response = await axios.get(
        "http://localhost:3000/data/creatives/" + creativeId
      );
      const creative = response.data;
      //console.log("Fetched creative data:", JSON.stringify(creative, null, 2));
      const resources = creative?.resources || {};
      let currentResource = {
        name: resource,
        items: [],
        mode: debug,
        extension: extension,
      };
      switch (resource) {
        case "components":
          currentResource.items = resources.components || [];
          break;
        case "libraries":
          currentResource.items = resources.libraries || [];
          break;
        case "assets":
          currentResource.items = resources.assets || [];
          break;
      }
      const bundledResource = await bundler.bundleComponents(currentResource);
      logger.info("Bundled resources:", bundledResource);
      res.setHeader("Content-Type", contentType);
      res.send(bundledResource.payload);
    } catch (error) {
      logger.error("Error fetching creative from MongoDB view:", error);
      res.status(500).json({
        message:
          "Assets route failed again to retrieve creative with ID: " +
          creativeId,
      });
    }
  }
);
export default router;
