import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createItemSchema } from "../validators/item.validator.js";
import {
  createItemController,
  listItemsController,
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

export default router;
