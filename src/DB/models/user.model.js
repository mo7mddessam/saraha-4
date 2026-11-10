import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  { code: String, expiresAt: Date, attempts: { type: Number, default: 0 } },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 20 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 20 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String }, // stored encrypted
    gender: { type: String, enum: ["male", "female"], default: "male" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profilePic: String,
    confirmEmail: { type: Boolean, default: false },
    emailOtp: otpSchema,
    passwordOtp: otpSchema,
    changeCredentialsTime: Date,
    isFrozen: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("username").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
