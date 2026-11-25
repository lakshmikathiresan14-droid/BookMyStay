import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Images are stored on the server's disk in server/uploads
export const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Only these types are accepted. The extension comes from the mime type,
// not from the original file name, so nobody can upload "evil.php".
const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    cb(null, unique + EXTENSIONS[file.mimetype]);
  },
});

const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    const err = new Error("Only JPG, PNG, WebP or GIF images are allowed");
    err.code = "BAD_FILE_TYPE";
    cb(err);
  },
}).single("image");

// Wraps multer so upload problems come back as a normal 400 JSON response.
export function uploadImage(req, res, next) {
  multerUpload(req, res, (err) => {
    if (!err) return next();

    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 5 MB" : err.message;
    res.status(400).json({ message, errors: { image: message } });
  });
}

// Deletes an image from disk. Ignores remote URLs (the seed data) and missing files.
export async function deleteImageFile(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;
  // basename() makes sure the path can't escape the uploads folder
  const filePath = path.join(UPLOAD_DIR, path.basename(imagePath));
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") console.warn("Could not delete image file:", err.message);
  }
}
