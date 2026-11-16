import { Router } from "express";
import {
  createBusinessController,
  currentBusinessController,
  getBusinessController,
  updateBusinessController,
} from "../controllers/business.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createBusinessSchema,
  updateBusinessSchema,
} from "../validators/business.validator.js";

const router = Router();
router.post(
  "/",
  requireAuth,
  validateBody(createBusinessSchema),
  createBusinessController,
);
router.get("/current", requireAuth, requireTenant, currentBusinessController);
router.get("/profile", requireAuth, requireTenant, getBusinessController);
router.patch(
  "/profile",
  requireAuth,
  requireTenant,
  validateBody(updateBusinessSchema),
  updateBusinessController,
);

export default router;
