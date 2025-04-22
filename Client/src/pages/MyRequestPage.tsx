// src/pages/MyRequestsPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { toast } from "react-toastify";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Check,
  X,
  Trash2,
  Phone,
  User,
  CalendarClock,
  Inbox,
  Send,
  AlertCircle,
  // Eye, // Added Inbox, Send
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion

// --- Services & State ---
import {
  getReceivedAdoptionRequests,
  getSentAdoptionRequests,
  approveAdoptionRequest,
  rejectAdoptionRequest,
  withdrawAdoptionRequest,
 
} from "@/services/requestService"; // Assuming types might be here now too
import { isAxiosError } from "@/services/authService";
import { authTokenState } from "@/store/authAtom"; // Ensure correct path
import { ReceivedRequestData, // Ensure these types handle potential BigInt from Prisma
  SentRequestData,RequestStatus} from "@/types/petTypes";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define RequestStatus locally if not importing from Prisma Client types directly
// enum RequestStatus { Pending = "Pending", Approved = "Approved", Rejected = "Rejected", Withdrawn = "Withdrawn" }

const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const token = useRecoilValue(authTokenState);

  // State for ALL requests initially
  const [allReceivedRequests, setAllReceivedRequests] = useState<
    ReceivedRequestData[]
  >([]);
  const [allSentRequests, setAllSentRequests] = useState<SentRequestData[]>([]);

  // State derived/filtered for display
  const [pendingReceived, setPendingReceived] = useState<ReceivedRequestData[]>(
    []
  );
  const [finalizedReceived, setFinalizedReceived] = useState<
    ReceivedRequestData[]
  >([]);
  const [pendingSent, setPendingSent] = useState<SentRequestData[]>([]);
  const [finalizedSent, setFinalizedSent] = useState<SentRequestData[]>([]);

  const [isLoadingReceived, setIsLoadingReceived] = useState(true);
  const [isLoadingSent, setIsLoadingSent] = useState(true);
  const [errorReceived, setErrorReceived] = useState<string | null>(null);
  const [errorSent, setErrorSent] = useState<string | null>(null);

  // --- Filtering Logic ---
  const filterAndSetRequests = (
    requests: (ReceivedRequestData | SentRequestData)[],
    setPending: React.Dispatch<React.SetStateAction<any[]>>,
    setFinalized: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const pending = requests.filter((r) => r.status === RequestStatus.Pending);
    const finalized = requests.filter(
      (r) => r.status !== RequestStatus.Pending
    );
    setPending(pending);
    setFinalized(finalized);
  };

  // --- Fetch Functions ---
  const fetchReceived = useCallback(async () => {
    setIsLoadingReceived(true);
    setErrorReceived(null);
    try {
      const response = await getReceivedAdoptionRequests();
      const data = response.data || [];
      setAllReceivedRequests(data); // Store all fetched data
      filterAndSetRequests(data, setPendingReceived, setFinalizedReceived); // Filter for display
    } catch (err) {
      console.error("Fetch received requests error:", err);
      // Avoid setting error for 404 if backend sends empty array for no requests
      if (isAxiosError(err) && err.response?.status !== 404) {
        const errorMsg =
          err.response?.data?.message || "Failed to load received requests.";
        setErrorReceived(errorMsg);
        // toast.error(errorMsg); // Optional: Show toast only for critical errors
      } else if (!isAxiosError(err)) {
        setErrorReceived("Failed to load received requests.");
      }
      // If it's a 404 or just no data, the empty array handling should suffice
      setAllReceivedRequests([]);
      filterAndSetRequests([], setPendingReceived, setFinalizedReceived);
    } finally {
      setIsLoadingReceived(false);
    }
  }, []); // Empty dependency array for useCallback

  const fetchSent = useCallback(async () => {
    setIsLoadingSent(true);
    setErrorSent(null);
    try {
      const response = await getSentAdoptionRequests();
      const data = response.data || [];
      setAllSentRequests(data);
      filterAndSetRequests(data, setPendingSent, setFinalizedSent);
    } catch (err) {
      console.error("Fetch sent requests error:", err);
      if (isAxiosError(err) && err.response?.status !== 404) {
        const errorMsg =
          err.response?.data?.message || "Failed to load sent requests.";
        setErrorSent(errorMsg);
      } else if (!isAxiosError(err)) {
        setErrorSent("Failed to load sent requests.");
      }
      setAllSentRequests([]);
      filterAndSetRequests([], setPendingSent, setFinalizedSent);
    } finally {
      setIsLoadingSent(false);
    }
  }, []); // Empty dependency array for useCallback

  // --- Initial Fetch and Auth Check ---
  useEffect(() => {
    if (token) {
      console.log("User is authenticated, fetching requests...");
      fetchReceived();
      fetchSent();
    } else {
      console.log("User not authenticated, redirecting to login.");
      // No need to set loading/error, just redirect if ProtectedRoute didn't catch it
      navigate("/login");
    }
    // Include fetch functions because they are defined with useCallback
  }, [token, fetchReceived, fetchSent, navigate]);

  // --- Action Handlers (with optimistic updates & refetch) ---
  const handleApprove = async (requestId: ReceivedRequestData["requestId"]) => {
  // Ensure string for display
    toast.info(`Approving request...`);

    // Optimistic update: Move from pending to finalized (approved)
    setPendingReceived((prev) => prev.filter((r) => r.requestId !== requestId));
    const requestToUpdate = allReceivedRequests.find(
      (r) => r.requestId === requestId
    );
    if (requestToUpdate) {
      setFinalizedReceived((prev) =>
        [...prev, { ...requestToUpdate, status: RequestStatus.Approved }].sort(
          (a, b) =>
            new Date(b.requestDate).getTime() -
            new Date(a.requestDate).getTime()
        )
      );
    }

    try {
      await approveAdoptionRequest(requestId);
      toast.success(`Request approved.`);
      // Refetch BOTH lists needed after approve action
      fetchReceived();
      fetchSent();
    } catch (error) {
      toast.error(`Failed to approve request.`);
      console.error(error);
      // Revert optimistic update by refetching
      fetchReceived();
    }
  };

  const handleReject = async (requestId: ReceivedRequestData["requestId"]) => {

    toast.info(`Rejecting request...`);

    // Optimistic update: Move from pending to finalized (rejected)
    setPendingReceived((prev) => prev.filter((r) => r.requestId !== requestId));
    const requestToUpdate = allReceivedRequests.find(
      (r) => r.requestId === requestId
    );
    if (requestToUpdate) {
      setFinalizedReceived((prev) =>
        [...prev, { ...requestToUpdate, status: RequestStatus.Rejected }].sort(
          (a, b) =>
            new Date(b.requestDate).getTime() -
            new Date(a.requestDate).getTime()
        )
      );
    }

    try {
      await rejectAdoptionRequest(requestId);
      toast.success(`Request rejected.`);
      fetchReceived(); // Only need to refetch received
    } catch (error) {
      toast.error(`Failed to reject request.`);
      console.error(error);
      fetchReceived(); // Revert optimistic update
    }
  };

  const handleWithdraw = async (requestId: SentRequestData["requestId"]) => {
   
    toast.info(`Withdrawing request...`);

    // Optimistic update: Move from pending to finalized (withdrawn)
    setPendingSent((prev) => prev.filter((r) => r.requestId !== requestId));
    const requestToUpdate = allSentRequests.find(
      (r) => r.requestId === requestId
    );
    if (requestToUpdate) {
      setFinalizedSent((prev) =>
        [...prev, { ...requestToUpdate, status: RequestStatus.Withdrawn }].sort(
          (a, b) =>
            new Date(b.requestDate).getTime() -
            new Date(a.requestDate).getTime()
        )
      );
    }

    try {
      await withdrawAdoptionRequest(requestId);
      toast.success(`Request withdrawn.`);
      fetchSent(); // Only need to refetch sent
      // fetchReceived(); // Optionally refetch received if lister needs immediate update
    } catch (error) {
      toast.error(`Failed to withdraw request.`);
      console.error(error);
      fetchSent(); // Revert optimistic update
    }
  };

  // --- Image URL Helper ---
  const getFullImageUrl = (relativePath: string | null | undefined): string => {
    const placeholder = "/images/placeholder-pet.png";
    if (!relativePath || !API_BASE_URL) return placeholder;
    try {
      return new URL(relativePath, API_BASE_URL).href;
    } catch (e) {
      return placeholder;
    }
  };

  // --- Status Badge Helper ---
  const getStatusBadgeVariant = (
    status: RequestStatus | string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case RequestStatus.Approved:
        return "default"; // Success/Greenish
      case RequestStatus.Pending:
        return "secondary"; // Neutral/Grey
      case RequestStatus.Rejected:
      case RequestStatus.Withdrawn:
        return "destructive"; // Danger/Red
      default:
        return "outline";
    }
  };

  // --- Render Helper for Request Cards (to avoid repetition) ---
  const renderRequestCard = (
    req: ReceivedRequestData | SentRequestData,
    type: "received" | "sent"
  ) => {
    const isReceived = type === "received";
    const requestData = req as any; // Use 'as any' carefully or create a common type
    const petInfo = requestData.pet;
    const otherUserInfo = isReceived ? requestData.requester : petInfo.lister;

    return (
      <Card
        key={String(requestData.requestId)}
        className="flex flex-col sm:flex-row items-start gap-4 p-4"
      >
        <img
          src={getFullImageUrl(petInfo.imageUrl)}
          alt={petInfo.name}
          className="w-full sm:w-24 h-24 object-cover rounded-md border bg-slate-100 flex-shrink-0" // Added flex-shrink-0
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder-pet.png";
          }}
        />
        <div className="flex-grow space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold">
              {isReceived ? "Request for " : ""}
              <Link
                to={`/pets/${String(petInfo.petId)}`}
                className="text-primary hover:underline"
              >
                {petInfo.name}
              </Link>
              {!isReceived ? " (Your Request)" : ""}
            </h3>
            <Badge
              variant={getStatusBadgeVariant(requestData.status)}
              className="capitalize text-xs sm:text-sm"
            >
              {requestData.status.toLowerCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="w-4 h-4" />
            {isReceived
              ? `Requester: ${otherUserInfo.name}`
              : `Lister: ${otherUserInfo.name}`}
            {isReceived && ` (${otherUserInfo.email})`}{" "}
            {/* Show email only for received */}
          </p>
          {/* Show contact only if received AND contact exists */}
          {isReceived && otherUserInfo.contactNumber && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {otherUserInfo.contactNumber}
            </p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarClock className="w-4 h-4" />
            {isReceived ? "Received" : "Sent"}:{" "}
            {new Date(requestData.requestDate).toLocaleString()}
          </p>
          {/* Show Pet status only for Sent requests */}
          {!isReceived && (
            <p className="text-xs text-muted-foreground">
              Pet Status:{" "}
              <span className="font-medium capitalize">
                {petInfo.adoptionStatus.toLowerCase()}
              </span>
            </p>
          )}
          {requestData.messageToLister && (
            <p className="text-sm mt-2 p-2 border rounded bg-slate-50 max-h-20 overflow-y-auto">
              {isReceived ? "Message from requester:" : "Your message:"}{" "}
              {requestData.messageToLister}
            </p>
          )}
        </div>
        {/* Action Buttons */}
        {requestData.status === RequestStatus.Pending && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 sm:pt-0 self-stretch sm:self-center flex-shrink-0">
            {" "}
            {/* Added flex-shrink-0 */}
            {isReceived ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 w-full sm:w-auto"
                  onClick={() => handleApprove(requestData.requestId)}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300 w-full sm:w-auto"
                  onClick={() => handleReject(requestData.requestId)}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                onClick={() => handleWithdraw(requestData.requestId)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Withdraw
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  };

  // --- Main Return ---
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        My Adoption Requests
      </h1>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
          {" "}
          {/* Centered TabsList */}
          <TabsTrigger value="received">
            <Inbox className="mr-2 h-4 w-4" />
            Received
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="mr-2 h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        {/* Received Requests Tab */}
        <TabsContent value="received" className="mt-6">
          {isLoadingReceived ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : errorReceived ? (
            <p className="text-center text-red-600 py-10 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" /> {errorReceived}
            </p>
          ) : allReceivedRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No adoption requests received yet.
            </p>
          ) : (
            <>
              {pendingReceived.length > 0 ? (
                <div className="space-y-4 mb-8">
                  <h2 className="text-xl font-semibold border-b pb-2">
                    Pending Your Review
                  </h2>
                  {pendingReceived.map((req) =>
                    renderRequestCard(req, "received")
                  )}
                </div>
              ) : (
                !errorReceived && ( // Show message only if no error and no pending
                  <p className="text-center text-muted-foreground py-4">
                    No pending requests to review.
                  </p>
                )
              )}

              {finalizedReceived.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="finalized-received">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      Processed Requests ({finalizedReceived.length})
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      {finalizedReceived.map((req) =>
                        renderRequestCard(req, "received")
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </>
          )}
        </TabsContent>

        {/* Sent Requests Tab */}
        <TabsContent value="sent" className="mt-6">
          {isLoadingSent ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : errorSent ? (
            <p className="text-center text-red-600 py-10 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" /> {errorSent}
            </p>
          ) : allSentRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              You haven't sent any adoption requests yet.
            </p>
          ) : (
            <>
              {pendingSent.length > 0 ? (
                <div className="space-y-4 mb-8">
                  <h2 className="text-xl font-semibold border-b pb-2">
                    Pending Requests
                  </h2>
                  {pendingSent.map((req) => renderRequestCard(req, "sent"))}
                </div>
              ) : (
                !errorSent && (
                  <p className="text-center text-muted-foreground py-4">
                    No pending requests sent.
                  </p>
                )
              )}

              {finalizedSent.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="finalized-sent">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      Processed Requests ({finalizedSent.length})
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      {finalizedSent.map((req) =>
                        renderRequestCard(req, "sent")
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyRequestsPage;
