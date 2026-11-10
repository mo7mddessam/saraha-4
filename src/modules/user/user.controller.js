import { User } from "../../DB/models/user.model.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";
import { compare, decrypt, encrypt, hash } from "../../utils/security.js";

const publicShape = (u) => ({ id: u._id, username: u.username, profilePic: u.profilePic });

export const getMyProfile = asyncHandler(async (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    user: {
      id: u._id,
      username: u.username,
      email: u.email,
      phone: u.phone ? decrypt(u.phone) : null,
      gender: u.gender,
      profilePic: u.profilePic,
      shareLink: `${req.protocol}://${req.get("host")}/api/users/${u._id}`,
      createdAt: u.createdAt,
    },
  });
});

// Public: what a visitor sees before sending an anonymous message
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, confirmEmail: true, isFrozen: false });
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, user: publicShape(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { phone, ...rest } = req.body;
  Object.assign(req.user, rest);
  if (phone) req.user.phone = encrypt(phone);
  await req.user.save();
  res.json({ success: true, message: "Profile updated" });
});

export const uploadProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("Image is required", 400);
  req.user.profilePic = `/uploads/${req.file.filename}`;
  await req.user.save();
  res.json({ success: true, profilePic: req.user.profilePic });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!(await compare(oldPassword, req.user.password))) throw new AppError("Old password is wrong", 400);
  req.user.password = await hash(newPassword);
  req.user.changeCredentialsTime = new Date(); // invalidates all old tokens
  await req.user.save();
  res.json({ success: true, message: "Password changed. Please login again" });
});

export const freezeAccount = asyncHandler(async (req, res) => {
  req.user.isFrozen = true;
  req.user.changeCredentialsTime = new Date();
  await req.user.save();
  res.json({ success: true, message: "Account frozen" });
});
