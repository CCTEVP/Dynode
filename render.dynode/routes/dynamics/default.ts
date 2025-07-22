import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
import bundler from "../../services/bundler";
import caching from "../../services/caching";
import axios from "axios";
import { builtinModules } from "module";
import { isErrored } from "stream";
const router = express.Router();
const CONTENT_TYPES: Record<string, string> = {
  js: "application/javascript",
  css: "text/css",
  json: "application/json",
  html: "text/html",
  txt: "text/plain",
};
const MIME_TYPES: Record<string, string> = {
  mov: "video/quicktime",
  mp4: "video/mp4",
  avi: "video/x-msvideo",
  webm: "video/webm",
  mkv: "video/x-matroska",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
  eot: "application/vnd.ms-fontobject",
};
router.get(
  "/:id/:resource.:debug.:extension",
  async (req: Request, res: Response, next: NextFunction) => {
    const creativeId = req.params.id;
    const resource = req.params.resource;
    const debug = req.params.debug === "min";
    const extension = req.params.extension;

    console.log("Raw params:", req.params);
    console.log("Original URL:", req.originalUrl);

    //check if extension is in CONTENT_TYPES or MIME_TYPES
    const isMedia = extension.toLowerCase() in MIME_TYPES;
    const isFile = extension.toLowerCase() in CONTENT_TYPES;
    const contentType =
      CONTENT_TYPES[extension.toLowerCase()] ||
      MIME_TYPES[extension.toLowerCase()] ||
      "application/octet-stream";
    console.log(
      `Fetching "this" resource: ${resource}, creativeId: ${creativeId}, debug: ${debug}, extension: ${extension}, isMedia: ${isMedia}, isFile: ${isFile}, contentType: ${contentType}`
    );
    console.log(
      "Matched /:id/:resource.:debug.:extension route!",
      req.originalUrl,
      req.params
    );
    try {
      // Check if the resource is media or file
      if (isMedia) {
        const response = await axios.get(
          "http://localhost:3000/files/assets/" + resource + "." + extension,
          { responseType: "arraybuffer" } // <-- Important for binary data!
        );
        res.type(contentType || "application/octet-stream");
        res.send(Buffer.from(response.data));
      } else if (isFile) {
        const response = await axios.get(
          "http://localhost:3000/data/creatives/" + creativeId
        );
        const creative = response.data;
        console.log(
          "Fetched creative data resources:",
          JSON.stringify(creative?.resources, null, 2)
        );
        const resources = creative?.resources || {};
        let currentResource = {
          creativeId: creativeId,
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
          case "manager":
            currentResource.items = resources.assets || [];
            break;
        }
        console.log(
          `About to bundle resource "${resource}" with items:`,
          JSON.stringify(currentResource.items, null, 2)
        );
        const bundledResource = await bundler.bundleComponents(currentResource);
        logger.info("Bundled resources:", bundledResource);
        res.setHeader("Content-Type", contentType);
        res.send(bundledResource.payload);
      }
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

      res.render("pages/dynamics/content", {
        content,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
