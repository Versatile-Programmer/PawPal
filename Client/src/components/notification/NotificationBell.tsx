// import React, { useEffect } from "react";
// import { useRecoilState, useRecoilValue } from "recoil";
// import { Bell } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { toast } from "react-toastify";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   notificationsState,
//   unreadNotificationsCountState,
//   AppNotification,
// } from "@/store/notificationAtom";
// import {
//   fetchUserNotifications,
//   markNotificationRead,
//   markAllNotificationsRead,
// } from "@/services/notificationService";
// import {
//   getNotificationTitle,
//   getNotificationIcon,
// } from "@/utils/notificationUtils"; // Import helpers
// import { authTokenState } from "@/store/authAtom"; // Import auth token
// import { useNavigate } from "react-router-dom"; // For navigation on click
// import { formatDistanceToNow } from "date-fns"; // For relative time

// const NotificationBell: React.FC = () => {
//   const token = useRecoilValue(authTokenState);
//   const [notifications, setNotifications] = useRecoilState(notificationsState);
//   const [unreadCount, setUnreadCount] = useRecoilState(
//     unreadNotificationsCountState
//   );
//   const navigate = useNavigate();

//   // Fetch notifications when component mounts or user logs in/out
//   useEffect(() => {
//     if (token) {
//       // Only fetch if logged in
//       const loadNotifications = async () => {
//         try {
//           const response = await fetchUserNotifications();
//           setNotifications(response.data || []);
//           setUnreadCount(response.unreadCount || 0);
//         } catch (error) {
//           console.error("Error fetching notifications for bell:", error);
//           // Optionally show a toast error here if needed
//         }
//       };
//       loadNotifications();

//       // Optional: Set up polling or WebSocket for real-time updates
//       // const intervalId = setInterval(loadNotifications, 30000); // Poll every 30s
//       // return () => clearInterval(intervalId);
//     } else {
//       // Clear notifications if user logs out
//       setNotifications([]);
//       setUnreadCount(0);
//     }
//   }, [token, setNotifications, setUnreadCount]);

//   const handleMarkOneAsRead = async (
//     notificationId: AppNotification["notificationId"]
//   ) => {
//     // Optimistically update UI
//     setNotifications((prev) =>
//       prev.map((n) =>
//         n.notificationId === notificationId ? { ...n, isRead: true } : n
//       )
//     );
//     setUnreadCount((prev) => Math.max(0, prev - 1)); // Ensure count doesn't go below 0

//     try {
//       await markNotificationRead(notificationId);
//       // No need to refetch, optimistic update is usually fine for "read" status
//     } catch (error) {
//       console.error(
//         `Failed to mark notification ${notificationId} as read:`,
//         error
//       );
//       // Revert optimistic update on error (or refetch)
//       toast.error("Failed to update notification status.");
//       // Simple refetch to revert:
//       // const response = await fetchUserNotifications();
//       // setNotifications(response.data || []);
//       // setUnreadCount(response.unreadCount || 0);
//     }
//   };

//   const handleMarkAllRead = async () => {
//     if (unreadCount === 0) return;

//     // Optimistic UI update
//     setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//     setUnreadCount(0);

//     try {
//       await markAllNotificationsRead();
//     } catch (error) {
//       console.error("Failed to mark all notifications as read:", error);
//       toast.error("Failed to mark all as read.");
//       // Revert by refetching
//     }
//   };

//   // --- Handle Notification Click (Navigate to related entity) ---
//   const handleNotificationClick = (notification: AppNotification) => {
//     // Mark as read first
//     if (!notification.isRead) {
//       handleMarkOneAsRead(notification.notificationId);
//     }

//     // Navigate based on type and entity (customize as needed)
//     // This requires your backend to consistently populate relatedEntityId and relatedEntityType
//     if (notification.relatedEntityType && notification.relatedEntityId) {
//       switch (notification.relatedEntityType) {
//         case "PET":
//           navigate(`/pets/${String(notification.relatedEntityId)}`);
//           break;
//         case "ADOPTION_REQUEST":
//           // Maybe navigate to the request detail or pet manage page
//           // For now, navigate to My Requests, assuming user can find it there.
//           navigate("/my-requests"); // Or a more specific URL if available
//           break;
//         // Add other entity types
//         default:
//           console.warn(
//             "Unknown relatedEntityType for navigation:",
//             notification.relatedEntityType
//           );
//           break;
//       }
//     }
//     // Close dropdown manually if needed (Shadcn might handle this if item is simple text)
//     // document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
//   };

//   if (!token) return null; // Don't render bell if not logged in

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger>
//         <Button variant="ghost" size="icon" className="relative">
//           <Bell className="h-5 w-5" />
//           {unreadCount > 0 && (
//             <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
//               {unreadCount > 9 ? "9+" : unreadCount}
//             </span>
//           )}
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         align="end"
//         className="w-80 md:w-96 max-h-[70vh] overflow-y-auto"
//       >
//         {" "}
//         {/* Increased width and max height */}
//         <DropdownMenuLabel className="flex justify-between items-center">
//           <span>Notifications</span>
//           {notifications.length > 0 && unreadCount > 0 && (
//             <Button
//               variant="link"
//               size="sm"
//               className="text-xs p-0 h-auto"
//               onClick={handleMarkAllRead}
//             >
//               Mark all as read
//             </Button>
//           )}
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         {notifications.length === 0 ? (
//           <DropdownMenuItem
//             disabled
//             className="text-center text-muted-foreground py-4"
//           >
//             No new notifications
//           </DropdownMenuItem>
//         ) : (
//           notifications.map((notification) => (
//             <DropdownMenuItem
//               key={String(notification.notificationId)}
//               // onClick should handle marking as read AND navigation
//               onClick={() => handleNotificationClick(notification)}
//               className={`flex items-start gap-3 p-3 cursor-pointer ${
//                 !notification.isRead
//                   ? "bg-primary/5 hover:bg-primary/10"
//                   : "hover:bg-accent"
//               }`}
//             >
//               <div className="flex-shrink-0 mt-0.5">
//                 {getNotificationIcon(notification.notificationType)}
//               </div>
//               <div className="flex-grow">
//                 <p
//                   className={`text-sm font-medium ${
//                     !notification.isRead
//                       ? "text-primary-foreground"
//                       : "text-foreground"
//                   }`}
//                 >
//                   {getNotificationTitle(notification.notificationType)}
//                 </p>
//                 <p
//                   className={`text-xs ${
//                     !notification.isRead
//                       ? "text-muted-foreground/90"
//                       : "text-muted-foreground"
//                   }`}
//                 >
//                   {notification.message}
//                 </p>
//                 <p className="text-xs text-muted-foreground/70 mt-1">
//                   {formatDistanceToNow(new Date(notification.createdAt), {
//                     addSuffix: true,
//                   })}
//                 </p>
//               </div>
//               {!notification.isRead && (
//                 <div className="ml-auto flex-shrink-0 self-center">
//                   <span
//                     className="h-2 w-2 rounded-full bg-blue-500 block"
//                     title="Unread"
//                   ></span>
//                 </div>
//               )}
//             </DropdownMenuItem>
//           ))
//         )}
//         {notifications.length > 0 && (
//           <>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem
//               onClick={() => navigate("/notifications")}
//               className="justify-center text-sm text-primary hover:underline"
//             >
//               View all notifications
//             </DropdownMenuItem>
//           </>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

// export default NotificationBell;
import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Bell, Mail } from "lucide-react"; // Keep Bell, Mail is for empty state
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { cn } from "@/lib/utils"; // Import cn for conditional classes

import {
  notificationsState,
  unreadNotificationsCountState,
  AppNotification, // Ensure this type is defined correctly
} from "@/store/notificationAtom"; // Ensure correct path
import {
  fetchUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/notificationService";
import {
  getNotificationTitle,
  getNotificationIcon,
} from "@/utils/notificationUtils";
import { authTokenState } from "@/store/authAtom"; // Ensure correct path
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns"; // Use Strict for concise output

const NotificationBell: React.FC = () => {
  const token = useRecoilValue(authTokenState);
  const [notifications, setNotifications] = useRecoilState(notificationsState);
  const [unreadCount, setUnreadCount] = useRecoilState(
    unreadNotificationsCountState
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const loadNotifications = async () => {
        try {
          const response = await fetchUserNotifications();
          setNotifications(response.data || []);
          setUnreadCount(response.unreadCount || 0);
        } catch (error) {
          console.error("Error fetching notifications for bell:", error);
          // toast.error("Could not load notifications."); // Optional: Can be noisy
        }
      };
      loadNotifications();

      // Optional: Polling (Consider WebSockets for real-time)
      // const intervalId = setInterval(loadNotifications, 30000);
      // return () => clearInterval(intervalId);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token, setNotifications, setUnreadCount]);

  const handleMarkOneAsRead = async (notification: AppNotification) => {
    if (notification.isRead) return; // Already read

    const originalNotifications = [...notifications]; // For potential revert
    const originalUnreadCount = unreadCount;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notification.notificationId
          ? { ...n, isRead: true }
          : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationRead(notification.notificationId);
    } catch (error) {
      console.error(
        `Failed to mark notification ${notification.notificationId} as read:`,
        error
      );
      toast.error("Failed to update notification status.");
      // Revert optimistic update on error
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all as read.");
      // Revert optimistic update on error
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      handleMarkOneAsRead(notification);
    }

    if (notification.relatedEntityType && notification.relatedEntityId) {
      switch (notification.relatedEntityType) {
        case "PET":
          navigate(`/pets/manage/${String(notification.relatedEntityId)}`);
          break;
        case "ADOPTION_REQUEST":
          // You might want a more specific link to the request itself if you build such a page
          // Or link to the pet details, which might show requests for the owner
          navigate("/my-requests"); // Default for now
          break;
        default:
          console.warn(
            "Unknown relatedEntityType for navigation:",
            notification.relatedEntityType
          );
          break;
      }
    }
    // Close dropdown: Shadcn DropdownMenu typically handles this when an item is clicked.
    // If not, you might need manual focus management or a slight delay.
  };

  if (!token) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {" "}
        {/* Use asChild with the Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 md:w-96 p-0 border shadow-xl rounded-lg bg-popover" // Use popover background
      >
        <DropdownMenuLabel className="flex justify-between items-center px-4 py-3 border-b">
          <span className="font-semibold text-base text-popover-foreground">
            Notifications
          </span>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto text-primary hover:text-primary/80"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from closing immediately
                handleMarkAllRead();
              }}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        {/* No DropdownMenuSeparator needed here as Label has border-b */}

        <ScrollArea className="max-h-[calc(70vh-4rem)]">
          {" "}
          {/* Adjusted max-h to account for label/footer */}
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 px-4">
              <Mail className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="font-medium">No new notifications</p>
              <p className="text-xs">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <React.Fragment key={String(notification.notificationId)}>
                <DropdownMenuItem
                  // Do not use `asChild` if the content is complex like this, handle click directly
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground", // Added focus/highlighted states
                    "border-b border-border/50 last:border-b-0", // Subtle separator
                    !notification.isRead && "bg-primary/5 hover:bg-primary/10" // Unread style
                    // notification.isRead && "hover:bg-accent" // Read hover style (already covered by focus/highlighted)
                  )}
                >
                  <div className="flex-shrink-0 pt-0.5 text-muted-foreground">
                    {getNotificationIcon(notification.notificationType)}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p
                      className={cn(
                        "text-sm leading-tight", // Adjusted leading for better spacing
                        !notification.isRead
                          ? "font-semibold text-popover-foreground"
                          : "text-popover-foreground"
                      )}
                    >
                      {getNotificationTitle(notification.notificationType)}
                    </p>
                    <p
                      className={cn(
                        "text-xs text-muted-foreground line-clamp-2",
                        !notification.isRead && "text-muted-foreground/90"
                      )}
                    >   
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNowStrict(
                        new Date(notification.createdAt),
                        {
                          addSuffix: true,
                        }
                      )}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="ml-auto flex-shrink-0 self-center pl-2">
                      <span
                        className="h-2 w-2 rounded-full bg-blue-500 block"
                        title="Unread"
                      ></span>
                    </div>
                  )}
                </DropdownMenuItem>
              </React.Fragment>
            ))
          )}
        </ScrollArea>
       
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;