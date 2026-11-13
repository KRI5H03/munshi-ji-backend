import { Router } from "express";
import {
  currentBusinessController,
  getBusinessController,
} from "../controllers/business.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";

const router = Router();
router.get("/current", requireAuth, requireTenant, currentBusinessController);
router.get("/profile", requireAuth, requireTenant, getBusinessController);

export default router;
