import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createSaleSchema } from "../validators/invoice.validator.js";
import {
  createSaleController,
  getSaleController,
} from "../controllers/sale.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireTenant,
  validateBody(createSaleSchema),
  createSaleController,
);
router.get("/:id", requireAuth, requireTenant, getSaleController);

export default router;
