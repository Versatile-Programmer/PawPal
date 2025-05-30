import { Router } from "express";
import AuthRoutes from "./authRoutes.routes.js";
import verifyRoutes from "./verifyRoutes.routes.js";
import petRoutes from "./petRoutes.routes.js";
import requestRoutes from "./requestRoutes.routes.js";
import notificationRoutes from "./notificationRoutes.routes.js";
const router = Router();
router.use("/", verifyRoutes);
router.use("/api/auth", AuthRoutes);
router.use("/api/pets", petRoutes);
router.use("/api/requests", requestRoutes);
router.use("/api/notifications", notificationRoutes);
export default router;
