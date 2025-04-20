import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { toast } from "react-toastify";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquarePlus } from "lucide-react";

// --- Types & State ---
// Import types needed from shared locations or define locally if necessary
import { AuthUser } from "@/store/authAtom"; // User info structure
import { PetDetailData } from "@/types/petTypes"; // Detailed Pet data structure
import { submitAdoptionRequest } from "@/services/requestService";
import { isAxiosError } from "@/services/authService";

// --- Props Interface ---
interface AdoptionRequestCardProps {
  pet: PetDetailData; // Pass the full pet details object
  currentUser: AuthUser | null; // Pass the current user state
  // Add an optional callback for when a request is successfully submitted
  onRequestSubmitted?: () => void;
}

const AdoptionRequestCard: React.FC<AdoptionRequestCardProps> = ({
  pet,
  currentUser,
  onRequestSubmitted,
}) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location for login redirect state

  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // --- Adoption Request Handler ---
 const handleAdoptionRequest = async () => {
   if (!currentUser || !pet || pet.adoptionStatus !== "Available") return;
   setIsSubmittingRequest(true);
   toast.info(`Submitting request for ${pet.name}...`);

   try {
     // --- Use the actual API Call ---
     const payload = {
       petId: Number(pet.petId), // Ensure petId is number if required by backend validator
       messageToLister: requestMessage || null, // Send null if message is empty
     };
     const response = await submitAdoptionRequest(payload);
     // --- End API Call ---

     toast.success(
       response.message || `Adoption request for ${pet.name} submitted!`
     );
     setRequestMessage("");
     setShowRequestModal(false);

     if (onRequestSubmitted) {
       onRequestSubmitted();
     }
   } catch (reqError: any) {
     console.error("Adoption request failed:", reqError);
     let errorMsg = "Failed to submit adoption request.";
     // Handle specific errors from backend response
     if (isAxiosError(reqError) && reqError.response) {
       errorMsg = reqError.response.data?.message || errorMsg;
     }
     toast.error(errorMsg);
     // Optionally keep modal open on error:
     // setShowRequestModal(true);
   } finally {
     setIsSubmittingRequest(false);
   }
 };

  // --- Render Logic ---
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Interested in Adoption?</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Case 1: Pet is Available */}
        {pet.adoptionStatus === "Available" ? (
          currentUser ? (
            // --- Case 1a: User is Logged In ---
            <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <MessageSquarePlus className="mr-2 h-4 w-4" /> Request to
                  Adopt {pet.name}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adoption Request for {pet.name}</DialogTitle>
                  <DialogDescription>
                    Send a message to the lister ({pet.lister.name}) along with
                    your request. They will be able to see your profile and
                    registered contact details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor={`message-${pet.petId}`}>
                      Your Message (Optional)
                    </Label>
                    <Textarea
                      placeholder="Tell the lister why you'd be a great home for this pet..."
                      id={`message-${pet.petId}`} // Use unique ID if multiple cards could exist
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isSubmittingRequest}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    onClick={handleAdoptionRequest}
                    disabled={isSubmittingRequest}
                  >
                    {isSubmittingRequest ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            // --- Case 1b: User is Logged Out ---
            <Button
              className="w-full"
              onClick={() => navigate("/login", { state: { from: location.pathname } })} // Pass current location state
            >
              Login to Request Adoption
            </Button>
          )
        ) : (
          // --- Case 2: Pet is Not Available ---
          <p className="text-sm text-center font-medium text-muted-foreground p-4 border rounded-md bg-slate-50">
            This pet is currently {pet.adoptionStatus.toLowerCase()} and not
            available for new adoption requests.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdoptionRequestCard;
