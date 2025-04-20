import { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { createAdoptionRequest } from "../controllers/requestController.controller.js";
const router = Router();
router.post("/create", authMiddleware, createAdoptionRequest);
export default router;
