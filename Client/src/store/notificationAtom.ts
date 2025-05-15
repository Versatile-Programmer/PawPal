import { atom } from "recoil";
import { Notification } from "@/types/notificationTypes";

// Define a more specific type for frontend use if needed, or use Prisma's Notification
export type AppNotification = Notification; 

export const notificationsState = atom<AppNotification[]>({
  key: "notificationsState",
  default: [],
});

export const unreadNotificationsCountState = atom<number>({
  key: "unreadNotificationsCountState",
  default: 0,
});

