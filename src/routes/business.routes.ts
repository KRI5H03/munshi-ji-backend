import { Router } from "express";
import { currentBusinessController } from "../controllers/business.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";

const router = Router();
router.get("/current", requireAuth, requireTenant, currentBusinessController);
export default router;
