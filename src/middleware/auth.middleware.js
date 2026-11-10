import { User } from "../DB/models/user.model.js";
import { AppError, asyncHandler } from "../utils/AppError.js";
import { verifyToken } from "../utils/security.js";

export const auth = (roles = []) =>
  asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) throw new AppError("Missing token", 401);

    let decoded;
    try {
      decoded = verifyToken(header.split(" ")[1]);
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError("User not found", 404);
    if (user.isFrozen) throw new AppError("Account is frozen", 403);
    if (
      user.changeCredentialsTime &&
      user.changeCredentialsTime.getTime() > decoded.iat * 1000
    )
      throw new AppError("Credentials changed, please login again", 401);
    if (roles.length && !roles.includes(user.role)) throw new AppError("Forbidden", 403);

    req.user = user;
    next();
  });
