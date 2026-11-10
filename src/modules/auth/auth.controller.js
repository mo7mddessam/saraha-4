import { User } from "../../DB/models/user.model.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";
import { compare, encrypt, generateOtp, hash, signToken } from "../../utils/security.js";
import { sendEmail } from "../../utils/email.js";

const OTP_TTL = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const buildOtp = async () => {
  const code = generateOtp();
  return { code, doc: { code: await hash(code), expiresAt: new Date(Date.now() + OTP_TTL), attempts: 0 } };
};

const checkOtp = async (otpDoc, code) => {
  if (!otpDoc?.code) throw new AppError("No OTP requested", 400);
  if (otpDoc.expiresAt < new Date()) throw new AppError("OTP expired", 400);
  if (otpDoc.attempts >= MAX_ATTEMPTS) throw new AppError("Too many attempts, request a new OTP", 429);
  return compare(code, otpDoc.code);
};

export const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, gender } = req.body;
  if (await User.findOne({ email })) throw new AppError("Email already exists", 409);

  const { code, doc } = await buildOtp();
  const user = await User.create({
    firstName,
    lastName,
    email,
    gender,
    password: await hash(password),
    phone: phone ? encrypt(phone) : undefined,
    emailOtp: doc,
  });

  await sendEmail({
    to: email,
    subject: "Confirm your email",
    html: `<h3>Welcome to Saraha 👋</h3><p>Your confirmation code: <b>${code}</b> (valid 10 minutes)</p>`,
  });

  res.status(201).json({ success: true, message: "Account created. Check your email for the OTP", id: user._id });
});

export const confirmEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);
  if (user.confirmEmail) throw new AppError("Email already confirmed", 400);

  const ok = await checkOtp(user.emailOtp, otp);
  if (!ok) {
    user.emailOtp.attempts += 1;
    await user.save();
    throw new AppError("Invalid OTP", 400);
  }
  user.confirmEmail = true;
  user.emailOtp = undefined;
  await user.save();
  res.json({ success: true, message: "Email confirmed" });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await compare(password, user.password)))
    throw new AppError("Invalid email or password", 401);
  if (!user.confirmEmail) throw new AppError("Please confirm your email first", 403);
  if (user.isFrozen) throw new AppError("Account is frozen", 403);

  const token = signToken({ id: user._id, role: user.role });
  res.json({ success: true, token });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // same response either way so emails can't be enumerated
  if (user && user.confirmEmail) {
    const { code, doc } = await buildOtp();
    user.passwordOtp = doc;
    await user.save();
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `<p>Your reset code: <b>${code}</b> (valid 10 minutes)</p>`,
    });
  }
  res.json({ success: true, message: "If the email exists, an OTP was sent" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid request", 400);

  const ok = await checkOtp(user.passwordOtp, otp);
  if (!ok) {
    user.passwordOtp.attempts += 1;
    await user.save();
    throw new AppError("Invalid OTP", 400);
  }
  user.password = await hash(newPassword);
  user.passwordOtp = undefined;
  user.changeCredentialsTime = new Date();
  await user.save();
  res.json({ success: true, message: "Password reset. Please login again" });
});
