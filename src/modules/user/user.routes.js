import { Router } from "express";
import { auth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import * as v from "./user.validation.js";
import * as c from "./user.controller.js";

const router = Router();

router.get("/profile", auth(), c.getMyProfile);
router.patch("/profile", auth(), validate(v.updateProfile), c.updateProfile);
router.patch("/profile/picture", auth(), upload.single("image"), c.uploadProfilePic);
router.patch("/password", auth(), validate(v.changePassword), c.changePassword);
router.delete("/freeze", auth(), c.freezeAccount);
router.get("/:id", validate(v.idParam), c.getPublicProfile);

export default router;
