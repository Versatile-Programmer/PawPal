import express from "express";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.controller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// All notification routes should be protected

// GET /api/notifications - Get all notifications for the user
router.get("/get", authMiddleware, getUserNotifications);

// PUT /api/notifications/all/read - Mark all as read
router.put("/all/read", authMiddleware, markAllNotificationsAsRead);

// PUT /api/notifications/:notificationId/read - Mark a single notification as read
router.put("/:notificationId/read", authMiddleware, markNotificationAsRead);

export default router;
