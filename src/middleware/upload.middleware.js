import multer from "multer";
import path from "path";
import crypto from "crypto";
import { AppError } from "../utils/AppError.js";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return cb(null, true);
    cb(new AppError("Only jpeg/png/webp images are allowed", 400));
  },
});
