import { Router } from "express";
import authRoutes from "./auth.routes.js";
import businessRoutes from "./business.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/businesses", businessRoutes);

export default router;
