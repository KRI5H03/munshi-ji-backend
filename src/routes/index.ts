import { Router } from "express";
import authRoutes from "./auth.routes.js";
import businessRoutes from "./business.routes.js";
import contactRoutes from "./contact.routes.js";
import itemRoutes from "./item.routes.js";
import saleRoutes from "./sale.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/businesses", businessRoutes);
router.use("/contacts", contactRoutes);
router.use("/items", itemRoutes);
router.use("/sales", saleRoutes);

export default router;
