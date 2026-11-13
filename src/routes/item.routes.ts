import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createItemSchema,
  updateItemSchema,
} from "../validators/item.validator.js";
import {
  createItemController,
  getItemController,
  listItemsController,
  updateItemController,
} from "../controllers/item.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireTenant,
  validateBody(createItemSchema),
  createItemController,
);
router.get("/", requireAuth, requireTenant, listItemsController);
router.get("/:id", requireAuth, requireTenant, getItemController);
router.patch(
  "/:id",
  requireAuth,
  requireTenant,
  validateBody(updateItemSchema),
  updateItemController,
);

export default router;
