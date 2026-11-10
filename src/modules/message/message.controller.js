import { Message } from "../../DB/models/message.model.js";
import { User } from "../../DB/models/user.model.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";

// Anonymous: no auth, sender is never stored
export const sendMessage = asyncHandler(async (req, res) => {
  const receiver = await User.findOne({ _id: req.params.receiverId, confirmEmail: true, isFrozen: false });
  if (!receiver) throw new AppError("Receiver not found", 404);

  const attachments = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const message = await Message.create({
    content: req.body.content,
    attachments,
    receiverId: receiver._id,
  });
  res.status(201).json({ success: true, message: "Message sent anonymously", id: message._id });
});

export const getMyMessages = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const filter = { receiverId: req.user._id };

  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("-receiverId -__v"),
    Message.countDocuments(filter),
  ]);
  res.json({ success: true, page, limit, total, messages });
});

export const getMessage = asyncHandler(async (req, res) => {
  const message = await Message.findOne({ _id: req.params.id, receiverId: req.user._id }).select("-receiverId -__v");
  if (!message) throw new AppError("Message not found", 404);
  res.json({ success: true, message });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const result = await Message.deleteOne({ _id: req.params.id, receiverId: req.user._id });
  if (!result.deletedCount) throw new AppError("Message not found", 404);
  res.json({ success: true, message: "Message deleted" });
});
