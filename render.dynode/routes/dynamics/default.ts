import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
import bundler from "../../services/bundler";
import caching from "../../services/caching";
import axios from "axios";
import { builtinModules } from "module";
import { isErrored } from "stream";
import config from "../../config";
import behaviours from "../../services/behaviours";
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
// Use internal service base for docker, external origin for browser-facing references.
const sourceBase =
  config.env === "docker"
    ? config.internalServices.source
    : config.externalOrigins.source;
const ASSETS_URL = sourceBase + "/files/assets";
const CREATIVES_URL = sourceBase + "/data/creatives";
if (config.env === "docker") {
  console.log(
    "[render.dynode] dynamics route using internal source base:",
    sourceBase,
  );
}

router.get(
  "/:id/:resource.:debug.:extension",
  async (req: Request, res: Response, next: NextFunction) => {
    const creativeId = req.params.id;
    const resource = req.params.resource;
    const debug = req.params.debug === "min";
    const extension = req.params.extension;
    //check if extension is in CONTENT_TYPES or MIME_TYPES
    const isMedia = extension.toLowerCase() in MIME_TYPES;
    const isFile = extension.toLowerCase() in CONTENT_TYPES;
    const contentType =
      CONTENT_TYPES[extension.toLowerCase()] ||
      MIME_TYPES[extension.toLowerCase()] ||
      "application/octet-stream";
    try {
      // Check if the resource is media or file
      if (isMedia) {
        const targetUrl = ASSETS_URL + "/" + resource + "." + extension;
        const response = await axios.get(targetUrl, {
          responseType: "arraybuffer",
        });
        res.type(contentType || "application/octet-stream");
        res.send(Buffer.from(response.data));
      } else if (isFile) {
        const response = await axios.get(CREATIVES_URL + "/" + creativeId);
        const creative = response.data;
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
        const bundledResource = await bundler.bundleComponents(currentResource);
        //logger.info("Bundled resources:", bundledResource);
        res.setHeader("Content-Type", contentType);
        res.send(bundledResource.payload);
      }
    } catch (error) {
      logger.error("Error fetching creative from MongoDB view:", error);
      res.status(500).json({
        message:
          "Assets route failed to retrieve creative with ID: " + creativeId,
      });
    }
  },
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
      const targetUrl = CREATIVES_URL + "/" + creativeId;
      const apiRes = await axios.get(targetUrl, {
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false,
        }),
      });
      const content = behaviours.applyBehavioursToCreative(apiRes.data);
      const baseURL =
        config.externalOrigins.render || `${req.protocol}://${req.get("host")}`;

      logger.info(`Rendering creative`, {
        creativeId,
        name: content?.name,
        hasElements: !!content?.elements,
        elementCount: content?.elements?.length || 0,
        hasStyles: !!content?.styles,
        styles: JSON.stringify(content?.styles || {}),
        elementsDetail: JSON.stringify(content?.elements || []),
      });

      res.render("pages/dynamics/content", {
        content,
        baseURL,
      });
    } catch (err) {
      logger.error("Creative fetch failed", {
        docker: config.env === "docker",
        target: CREATIVES_URL,
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  },
);

export default router;
