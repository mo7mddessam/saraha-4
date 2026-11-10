import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export const hash = (plain) => bcrypt.hash(plain, env.saltRounds);
export const compare = (plain, hashed) => bcrypt.compare(plain, hashed);

export const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

// AES-256-CBC encryption for sensitive fields (phone)
export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(env.encKey), iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${enc.toString("hex")}`;
};

export const decrypt = (data) => {
  const [iv, enc] = data.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(env.encKey),
    Buffer.from(iv, "hex")
  );
  return Buffer.concat([decipher.update(Buffer.from(enc, "hex")), decipher.final()]).toString("utf8");
};

export const generateOtp = () => crypto.randomInt(100000, 999999).toString();
