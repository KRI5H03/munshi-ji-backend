import { Router } from "express";
import {
  createContactsController,
  listContactsController,
} from "../controllers/contact.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createContactSchema } from "../validators/contact.validator.js";

const router = Router();
router.post(
  "/",
  requireAuth,
  requireTenant,
  validateBody(createContactSchema),
  createContactsController,
);
router.get("/", requireAuth, requireTenant, listContactsController);
export default router;
