import axios from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig"; // Your API endpoint definitions
// Assuming you have a Notification type defined in your frontend types
// If not, you can use Prisma's generated type or define it manually
import { Notification } from "@/types/notificationTypes"; // Example if using Prisma types

// Define a type for frontend use, can be same as Prisma's or a subset
export type AppNotification = Notification; // Or your custom frontend Notification type

// Define expected response structures
interface GetNotificationsResponse {
  data: AppNotification[];
  unreadCount: number;
}

interface ActionSuccessResponse {
  // Generic response for mark as read actions
  message: string;
  // Add other fields if your backend returns more data
}

/**
 * Fetches all notifications for the logged-in user.
 */
export const fetchUserNotifications =
  async (): Promise<GetNotificationsResponse> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token)
        throw new Error("User not authenticated for fetching notifications.");

      console.log(
        "Fetching notifications from:",
        API_ENDPOINTS.GET_NOTIFICATIONS
      );
      const response = await axios.get<GetNotificationsResponse>(
        API_ENDPOINTS.GET_NOTIFICATIONS, 
        {
          headers: { Authorization: token },
        }
      );
      console.log("Get notifications response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error; // Re-throw for component handling
    }
  };

/**
 * Marks a single notification as read.
 */
export const markNotificationRead = async (
  notificationId: number | string | BigInt
): Promise<ActionSuccessResponse> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token)
      throw new Error("User not authenticated for marking notification read.");

    const url = API_ENDPOINTS.MARK_NOTIFICATION_READ.replace(
      ":notificationId",
      String(notificationId)
    );
    console.log(`Marking notification read at: PUT ${url}`);

    const response = await axios.put<ActionSuccessResponse>(
      url, // Example: `${API_BASE_URL}/notifications/:notificationId/read`
      null, // PUT requests often expect a body, even if null
      {
        headers: { Authorization: token },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read:`,
      error
    );
    throw error;
  }
};

/**
 * Marks all notifications for the user as read.
 */
export const markAllNotificationsRead =
  async (): Promise<ActionSuccessResponse> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token)
        throw new Error(
          "User not authenticated for marking all notifications read."
        );

      console.log(
        "Marking all notifications read at: PUT",
        API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ
      );
      const response = await axios.put<ActionSuccessResponse>(
        API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, // Example: `${API_BASE_URL}/notifications/all/read`
        null, // PUT requests often expect a body
        {
          headers: { Authorization: token },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };
