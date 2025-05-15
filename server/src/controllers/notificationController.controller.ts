// src/controllers/notificationsController.ts
import { Request, Response } from "express";
import prisma from "../config/database.js";
import { serializeBigInt } from "../helper.js";

// --- Get all notifications for the logged-in user ---
export const getUserNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Fetch notifications, newest first
    const notifications = await prisma.notification.findMany({
      where: { userId: BigInt(userId) , isRead: false},
      orderBy: { createdAt: "desc" },
      take: 10, // Limit to recent 50 notifications, add pagination later if needed
    });

    // Get unread count separately
    const unreadCount = await prisma.notification.count({
      where: {
        userId: BigInt(userId),
        isRead: false,
      },
    });

    res.status(200).json({
      data: serializeBigInt(notifications),
      unreadCount: unreadCount,
    });
    return;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

// --- Mark a single notification as read ---
export const markNotificationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params; // Get notificationId from URL parameter

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const id = BigInt(notificationId);

    // Update the notification, ensuring it belongs to the current user
    const updatedNotification = await prisma.notification.updateMany({
      where: {
        notificationId: id,
        userId: BigInt(userId),
        isRead: false, // Ensure user owns this notification
      },
      data: { isRead: true },
    });

    if (updatedNotification.count === 0) {
      // Either notification not found or doesn't belong to user
      res.status(404).json({
        message: "Notification not found or not authorized to update.",
      });
      return;
    }

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(404).json({ message: "Internal Server Error." });
    return;
  }
};

// --- Mark all notifications as read ---
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    await prisma.notification.updateMany({
      where: {
        userId: Number(userId),
        isRead: false, // Only update unread ones
      },
      data: { isRead: true },
    });

    res.status(200).json({ message: "All notifications marked as read." });
    return;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
