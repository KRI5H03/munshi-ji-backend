import { Router } from "express";
import { registerSchema } from "../validators/auth.validator.js";
import { registerController } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";

const router = Router();
router.post("/register", validateBody(registerSchema), registerController);
export default router;
