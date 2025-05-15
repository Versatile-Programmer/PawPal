import { NotificationType } from "@/types/notificationTypes"; // Import the enum
import {
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Trash2,
  HeartIcon
} from "lucide-react";
export const getNotificationTitle = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.ADOPTION_REQUEST_RECEIVED:
      return "New Adoption Request";
    case NotificationType.ADOPTION_REQUEST_APPROVED:
      return "Request Approved!";
    case NotificationType.ADOPTION_REQUEST_REJECTED:
      return "Request Update";
    case NotificationType.ADOPTION_REQUEST_SUBMITTED:
      return "Request Submitted";
    case NotificationType.ADOPTION_REQUEST_WITHDRAWN:
      return "Request Withdrawn";
    case NotificationType.PET_LISTING_DELETED:
      return "Listing Removed";
    case NotificationType.NEW_PET_MATCH: // Example for a future feature
      return "New Pet Match!";
    default:
      // Assert Exhaustiveness: This will cause a TypeScript error if a new enum member is added
      // and not handled here, which is good for maintenance.
      return "Notification"; // Fallback
  }
};

// Optional: Get an icon based on notification type

import React from "react";

export const getNotificationIcon = (
  type: NotificationType
): React.ReactElement => {
  switch (type) {
    case NotificationType.ADOPTION_REQUEST_RECEIVED:
      return <Mail className="h-5 w-5 text-blue-500" />;
    case NotificationType.ADOPTION_REQUEST_APPROVED:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case NotificationType.ADOPTION_REQUEST_REJECTED:
      return <XCircle className="h-5 w-5 text-red-500" />;
    case NotificationType.ADOPTION_REQUEST_SUBMITTED:
      return <Send className="h-5 w-5 text-sky-500" />;
    case NotificationType.ADOPTION_REQUEST_WITHDRAWN:
      return <Trash2 className="h-5 w-5 text-orange-500" />;
    case NotificationType.PET_LISTING_DELETED:
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case NotificationType.NEW_PET_MATCH:
      return <HeartIcon className="h-5 w-5 text-pink-500" />;
    default:
      return <Mail className="h-5 w-5 text-gray-500" />;
  }
};
