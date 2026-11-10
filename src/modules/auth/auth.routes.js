import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validation.middleware.js";
import * as v from "./auth.validation.js";
import * as c from "./auth.controller.js";

const router = Router();
router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { success: false, message: "Too many requests" } }));

router.post("/signup", validate(v.signup), c.signup);
router.post("/confirm-email", validate(v.confirmEmail), c.confirmEmail);
router.post("/login", validate(v.login), c.login);
router.post("/forgot-password", validate(v.forgotPassword), c.forgotPassword);
router.post("/reset-password", validate(v.resetPassword), c.resetPassword);

export default router;
