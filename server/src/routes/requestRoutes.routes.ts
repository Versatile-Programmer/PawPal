import { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { approveRequests, createAdoptionRequest, getReceivedRequests, getSentRequests, rejectRequests, withdrawRequest } from "../controllers/requestController.controller.js";
const router = Router();


router.post("/create", authMiddleware, createAdoptionRequest);
router.get("/received",authMiddleware,getReceivedRequests);
router.get("/sent",authMiddleware,getSentRequests);
router.put("/:id/approve",authMiddleware,approveRequests);
router.put("/:id/reject",authMiddleware,rejectRequests);
router.delete("/:id/withdraw",authMiddleware,withdrawRequest);

export default router;