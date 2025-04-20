import { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { createAdoptionRequest, getReceivedRequests, getSentRequests } from "../controllers/requestController.controller.js";
const router = Router();


router.post("/create", authMiddleware, createAdoptionRequest);
router.get("/received",authMiddleware,getReceivedRequests)
router.get("/sent",authMiddleware,getSentRequests)

export default router;