import { Router } from "express";
import authRoutes from "./auth.routes.js";
import businessRoutes from "./business.routes.js";
import contactRoutes from "./contact.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/businesses", businessRoutes);
router.use("/contacts", contactRoutes);

export default router;
