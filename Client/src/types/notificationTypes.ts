export enum NotificationType {
  ADOPTION_REQUEST_RECEIVED,
  ADOPTION_REQUEST_APPROVED,
  ADOPTION_REQUEST_REJECTED,
  ADOPTION_REQUEST_SUBMITTED,
  ADOPTION_REQUEST_WITHDRAWN,
  PET_LISTING_DELETED,
  NEW_PET_MATCH,
}

export type Notification = {
  notificationId: bigint;
  userId: bigint;
  notificationType: NotificationType; // Replace with actual enum values
  message: string;
  createdAt: string; // Use string for JSON-serialized Date
  isRead: boolean;
  relatedEntityId?: bigint;
  relatedEntityType?: "ADOPTION_REQUEST" | "PET" | "USER" | string; // Replace with actual enum values
};
