import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  saltRounds: Number(process.env.SALT_ROUNDS) || 10,
  encKey: process.env.ENC_KEY,
  email: process.env.EMAIL,
  emailPass: process.env.EMAIL_PASS,
};
