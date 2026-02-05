import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import config from "../config";
const assetsDestFolder = config.assetsFolder;

const VIDEO_EXTS = ["mov", "mp4", "avi", "webm", "mkv"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "svg", "gif", "bmp", "webp"];
const FONT_EXTS = ["ttf", "otf", "woff", "woff2", "eot"];
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

// Generate a random filename
function generateRandomName(length = 20) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    let folder = "";
    if (VIDEO_EXTS.includes(ext)) {
      folder = "video";
    } else if (IMAGE_EXTS.includes(ext)) {
      folder = "image";
    } else if (FONT_EXTS.includes(ext)) {
      folder = "fonts";
    } else {
      return cb(new Error("Unsupported file extension."), "");
    }
    const dest = path.join(__dirname, assetsDestFolder, folder);
    fs.mkdirSync(dest, { recursive: true });
    (req as any).fileDestination = dest;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const dir = (req as any).fileDestination;

    function generateUniqueName() {
      return generateRandomName(20) + ext;
    }

    function tryName() {
      const filename = generateUniqueName();
      const filePath = path.join(dir, filename);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          cb(null, filename);
        } else {
          tryName();
        }
      });
    }
    tryName();
  },
});

// Use .array('files') for multiple, .single('file') for single
// 50MB file size limit
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB in bytes
  },
});

// Helper to get mime and kind from file
export function getAssetInfo(
  fileOrFiles: Express.Multer.File | Express.Multer.File[],
): { mime: string; kind: string; filename: string; extension: string }[] {
  const processFile = (file: Express.Multer.File) => {
    const ext = path.extname(file.filename).slice(1).toLowerCase();
    const filenameWithoutExt = path.basename(
      file.filename,
      path.extname(file.filename),
    );

    let kind = "";
    if (VIDEO_EXTS.includes(ext)) kind = "video";
    else if (IMAGE_EXTS.includes(ext)) kind = "image";
    else if (FONT_EXTS.includes(ext)) kind = "font";
    else kind = "other";

    const mime = MIME_TYPES[ext] || file.mimetype || "application/octet-stream";
    return { mime, kind, filename: filenameWithoutExt, extension: ext };
  };

  if (Array.isArray(fileOrFiles)) {
    return fileOrFiles.map(processFile);
  } else if (fileOrFiles) {
    return [processFile(fileOrFiles)];
  } else {
    return [];
  }
}
