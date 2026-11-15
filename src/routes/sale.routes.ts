import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createSaleSchema } from "../validators/invoice.validator.js";
import { createSaleController } from "../controllers/sale.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireTenant,
  validateBody(createSaleSchema),
  createSaleController,
);

export default router;
