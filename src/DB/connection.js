import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.dbUri);
    console.log("✅ DB connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
};
