import { Router } from "express";
import AuthRoutes from "./authRoutes.js";
import verifyRoutes from "./verifyRoutes.js";
const router = Router();
router.use("/api/auth", AuthRoutes);
router.use("/", verifyRoutes);
export default router;
