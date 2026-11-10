import { Router } from "express";
import { auth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import * as v from "./message.validation.js";
import * as c from "./message.controller.js";

const router = Router();

router.post("/:receiverId", upload.array("attachments", 3), validate(v.sendMessage), c.sendMessage);
router.get("/", auth(), c.getMyMessages);
router.get("/:id", auth(), validate(v.idParam), c.getMessage);
router.delete("/:id", auth(), validate(v.idParam), c.deleteMessage);

export default router;
