import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  cancelSaleSchema,
  createSaleSchema,
} from "../validators/invoice.validator.js";
import {
  cancelSaleController,
  createSaleController,
  getSaleController,
  listSalesController,
} from "../controllers/sale.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireTenant,
  validateBody(createSaleSchema),
  createSaleController,
);
router.get("/", requireAuth, requireTenant, listSalesController);
router.get("/:id", requireAuth, requireTenant, getSaleController);
router.post(
  "/:id/cancel",
  requireAuth,
  requireTenant,
  validateBody(cancelSaleSchema),
  cancelSaleController,
);

export default router;
