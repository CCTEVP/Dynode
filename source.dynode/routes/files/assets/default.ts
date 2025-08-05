import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import logger from "../../../services/logger";
import Asset from "../../../models/collections/AssetsCollection";
import { upload, getAssetInfo } from "../../../services/register";

const router = express.Router();

router.post("/", upload.array("files"), async (req: Request, res: Response) => {
  const editorUserId = req.user?.userId || "000000000000000000000000";

  // req.files is an array of files
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    console.error("No files uploaded");
    logger.error("No files uploaded");
    res.status(400).json({ error: "No files uploaded." });
    return;
  }

  const now = new Date();
  const assetInfos = getAssetInfo(files); // always an array
  const kind = assetInfos[0]?.kind || "other";
  const paths = assetInfos.map((info) => ({
    mime: info.mime,
    filename: info.filename,
    extension: info.extension,
  }));

  const asset = new Asset({
    kind,
    created: now,
    updated: now,
    status: "",
    paths,
    changes: [
      {
        timestamp: now,
        user: editorUserId,
        newValue: "New asset uploaded",
      },
    ],
  });

  try {
    await asset.save();
    logger.info(
      `Files uploaded and asset created: ${paths
        .map((p) => p.filename + p.extension)
        .join(", ")}`
    );
    res.json({
      message: "Files uploaded and asset created successfully.",
      asset,
    });
  } catch (err) {
    logger.error("Error saving asset document", err);
    res.status(500).json({ error: "Error saving asset document." });
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
    `${filename}.${extension}`
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
