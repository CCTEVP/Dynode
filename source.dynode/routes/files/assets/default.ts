import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import logger from "../../../services/logger";
import Asset from "../../../models/collections/AssetsCollection";
import { upload, getAssetInfo } from "../../../services/register";

const router = express.Router();

router.post("/", upload.array("files"), async (req: Request, res: Response) => {
  const editorUserId = req.user?.userId || "000000000000000000000000";
  const { bundleId, assetName, assetId } = req.body;

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    logger.error("No files uploaded");
    res.status(400).json({ error: "No files uploaded." });
    return;
  }

  const now = new Date();
  const assetInfos = getAssetInfo(files);
  const kind = assetInfos[0]?.kind || "other";
  const paths = assetInfos.map((info) => ({
    mime: info.mime,
    filename: info.filename,
    extension: info.extension,
  }));

  try {
    let asset;

    if (bundleId && mongoose.Types.ObjectId.isValid(bundleId)) {
      // Add to existing bundle
      asset = await Asset.findById(bundleId);
      if (!asset) {
        res.status(404).json({ error: "Bundle not found." });
        return;
      }

      if (assetId && mongoose.Types.ObjectId.isValid(assetId)) {
        // Add paths to existing asset item in bundle
        const assetItem = asset.bundle.find(
          (item: any) => item._id.toString() === assetId,
        );
        if (assetItem) {
          assetItem.paths.push(...paths);
          assetItem.updated = now;
        } else {
          res.status(404).json({ error: "Asset item not found in bundle." });
          return;
        }
      } else {
        // Add new asset item to bundle
        asset.bundle.push({
          _id: new mongoose.Types.ObjectId(),
          name: assetName || files[0].originalname || "Unnamed Asset",
          kind,
          created: now,
          updated: now,
          status: "",
          paths,
        });
      }

      asset.updated = now;
      asset.changes.push({
        timestamp: now,
        user: new mongoose.Types.ObjectId(editorUserId),
      });

      await asset.save();
      logger.info(`Files added to bundle ${bundleId}`);
    } else {
      // Create new bundle with single asset item
      asset = new Asset({
        bundle: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: assetName || files[0].originalname || "Unnamed Asset",
            kind,
            created: now,
            updated: now,
            status: "",
            paths,
          },
        ],
        created: now,
        updated: now,
        changes: [
          {
            timestamp: now,
            user: new mongoose.Types.ObjectId(editorUserId),
          },
        ],
      });

      await asset.save();
      logger.info(`New bundle created: ${asset._id}`);
    }

    res.json({
      message: "Files uploaded successfully.",
      asset,
    });
  } catch (err) {
    logger.error("Error saving asset", err);
    res.status(500).json({ error: "Error saving asset." });
  }
});

router.get("/:filename.:extension", (req: Request, res: Response) => {
  const { filename, extension } = req.params;
  logger.info(`Requested file: ${filename}.${extension}`);
  const ext = extension.toLowerCase();
  const [{ kind, mime } = { kind: undefined, mime: undefined }] = getAssetInfo({
    filename: `${filename}.${extension}`,
    mimetype: "",
  } as any);

  let folder = "";
  if (kind === "video") {
    folder = "video";
  } else if (kind === "image") {
    folder = "image";
  } else if (kind === "font") {
    folder = "font/" + filename;
  } else {
    logger.warn(`Unsupported extension requested: ${extension}`);
    res.status(400).json({ error: "Unsupported file extension." });
    return;
  }

  const filePath = path.join(
    __dirname,
    "../../../files",
    folder,
    `${filename}.${extension}`,
  );
  logger.info(`Serving file: ${filePath}`);
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      logger.error(`File not found: ${filePath}`);
      res.status(404).json({ error: "File not found in " + filePath });
      return;
    }
    // Set the correct Content-Type header
    res.type(mime || "application/octet-stream");
    res.sendFile(path.resolve(filePath));
  });
});

export default router;
