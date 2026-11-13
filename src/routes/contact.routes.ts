import { Router } from "express";
import {
  createContactController,
  deleteContactController,
  getContactController,
  listContactsController,
  updateContactController,
} from "../controllers/contact.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../validators/contact.validator.js";

const router = Router();
router.post(
  "/",
  requireAuth,
  requireTenant,
  validateBody(createContactSchema),
  createContactController,
);
router.get("/", requireAuth, requireTenant, listContactsController);
router.get("/:id", requireAuth, requireTenant, getContactController);
router.patch(
  "/:id",
  requireAuth,
  requireTenant,
  validateBody(updateContactSchema),
  updateContactController,
);
router.delete("/:id", requireAuth, requireTenant, deleteContactController);
export default router;
