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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Services & State ---
import {
  getReceivedAdoptionRequests,
  getSentAdoptionRequests,
} from "@/services/requestService";
import { isAxiosError } from "@/services/authService";
import { authTokenState } from "@/store/authAtom";
import { ReceivedRequestData, SentRequestData } from "@/types/petTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const token = useRecoilValue(authTokenState);

  const [receivedRequests, setReceivedRequests] = useState<
    ReceivedRequestData[]
  >([]);
  const [sentRequests, setSentRequests] = useState<SentRequestData[]>([]);
  const [isLoadingReceived, setIsLoadingReceived] = useState(true);
  const [isLoadingSent, setIsLoadingSent] = useState(true);
  const [errorReceived, setErrorReceived] = useState<string | null>(null);
  const [errorSent, setErrorSent] = useState<string | null>(null);

  const fetchReceived = useCallback(async () => {
    setIsLoadingReceived(true);
    setErrorReceived(null);
    try {
      const response = await getReceivedAdoptionRequests();
      setReceivedRequests(response.data || []);
    } catch (err) {
      const errorMsg =
        (isAxiosError(err) && err.response?.data?.message) ||
        "Failed to load received requests.";
      setErrorReceived(errorMsg);
    } finally {
      setIsLoadingReceived(false);
    }
  }, []);

  const fetchSent = useCallback(async () => {
    setIsLoadingSent(true);
    setErrorSent(null);
    try {
      const response = await getSentAdoptionRequests();
      setSentRequests(response.data || []);
    } catch (err) {
      const errorMsg =
        (isAxiosError(err) && err.response?.data?.message) ||
        "Failed to load sent requests.";
      setErrorSent(errorMsg);
    } finally {
      setIsLoadingSent(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchReceived();
      fetchSent();
    } else {
      setIsLoadingReceived(false);
      setIsLoadingSent(false);
      navigate("/login");
    }
  }, [token, fetchReceived, fetchSent, navigate]);

  const handleApprove = (requestId: number | string | BigInt) => {
    toast.info(`TODO: Approve request ${requestId}`);
  };

  const handleReject = (requestId: number | string | BigInt) => {
    toast.info(`TODO: Reject request ${requestId}`);
  };

  const handleWithdraw = (requestId: number | string | BigInt) => {
    toast.info(`TODO: Withdraw request ${requestId}`);
  };

  const getFullImageUrl = (relativePath: string | null | undefined): string => {
    const placeholder = "/images/placeholder-pet.png";
    if (!relativePath || !API_BASE_URL) return placeholder;
    try {
      return new URL(relativePath, API_BASE_URL).href;
    } catch (e) {
      return placeholder;
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
      case "Withdrawn":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        My Adoption Requests
      </h1>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 ml-auto">
          <TabsTrigger value="received">Received (For My Pets)</TabsTrigger>
          <TabsTrigger value="sent">Sent (By Me)</TabsTrigger>
        </TabsList>

        {/* Received Requests Tab */}
        <TabsContent value="received" className="mt-6">
          {isLoadingReceived ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : errorReceived ? (
            <p className="text-center text-red-600 py-10">{errorReceived}</p>
          ) : receivedRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No adoption requests received for your pets yet.
            </p>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((req) => (
                <Card
                  key={String(req.requestId)}
                  className="flex flex-col sm:flex-row items-start gap-4 p-4"
                >
                  <img
                    src={getFullImageUrl(req.pet.imageUrl)}
                    alt={req.pet.name}
                    className="w-full sm:w-24 h-24 object-cover rounded-md border bg-slate-100"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder-pet.png";
                    }}
                  />

                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">
                        Request for{" "}
                        <Link
                          to={`/pets/manage/${String(req.pet.petId)}`}
                          className="text-primary hover:underline"
                        >
                          {req.pet.name}
                        </Link>
                      </h3>
                      <Badge
                        variant={getStatusBadgeVariant(req.status)}
                        className="capitalize"
                      >
                        {req.status.toLowerCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {req.requester.name} ({req.requester.email})
                    </p>
                    {req.requester.contactNumber && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {req.requester.contactNumber}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarClock className="w-4 h-4" />
                      Received: {new Date(req.requestDate).toLocaleString()}
                    </p>
                    {req.messageToLister && (
                      <p className="text-sm mt-2 p-2 border rounded bg-slate-50">
                        {req.messageToLister}
                      </p>
                    )}
                  </div>

                  {req.status === "Pending" && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 sm:pt-0 self-stretch sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                        onClick={() => handleApprove(req.requestId)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                        onClick={() => handleReject(req.requestId)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sent Requests Tab */}
        <TabsContent value="sent" className="mt-6">
          {isLoadingSent ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : errorSent ? (
            <p className="text-center text-red-600 py-10">{errorSent}</p>
          ) : sentRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              You haven't requested to adopt any pets yet.
            </p>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((req) => (
                <Card
                  key={String(req.requestId)}
                  className="flex flex-col sm:flex-row items-start gap-4 p-4"
                >
                  <img
                    src={getFullImageUrl(req.pet.imageUrl)}
                    alt={req.pet.name}
                    className="w-full sm:w-24 h-24 object-cover rounded-md border bg-slate-100"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder-pet.png";
                    }}
                  />

                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">
                        Request for{" "}
                        <Link
                          to={`/pets/manage/${String(req.pet.petId)}`}
                          className="text-primary hover:underline"
                        >
                          {req.pet.name}
                        </Link>
                      </h3>
                      <Badge
                        variant={getStatusBadgeVariant(req.status)}
                        className="capitalize"
                      >
                        {req.status.toLowerCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Lister: {req.pet.lister.name}
                    </p>
                    {req.pet.lister.contactNumber && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {req.pet.lister.contactNumber}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarClock className="w-4 h-4" />
                      Sent: {new Date(req.requestDate).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pet Status:{" "}
                      <span className="font-medium capitalize">
                        {req.pet.adoptionStatus.toLowerCase()}
                      </span>
                    </p>

                    {req.messageToLister && (
                      <p className="text-sm mt-2 p-2 border rounded bg-slate-50">
                        Your message: {req.messageToLister}
                      </p>
                    )}
                  </div>

                  {req.status === "Pending" && (
                    <div className="flex items-center pt-2 sm:pt-0 self-stretch sm:self-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleWithdraw(req.requestId)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Withdraw
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyRequestsPage;
