import { Router } from "express";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";

const router = Router();
router.post("/register", validateBody(registerSchema), registerController);
router.post("/login", validateBody(loginSchema), loginController);
export default router;
