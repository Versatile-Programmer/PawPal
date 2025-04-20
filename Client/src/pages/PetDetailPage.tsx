// src/pages/PetDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { toast } from "react-toastify";
import AdoptionRequestCard from "@/components/pets/AdoptionRequestCard";
// --- UI Components ---
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  MailIcon,
  PhoneIcon,
  UserIcon,
  CalendarDaysIcon,
  LockIcon,
  LogInIcon,
} from "lucide-react";
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

// --- Service & State ---
import { getPetById, deletePetById } from "@/services/petService"; // Added deletePetById
import { isAxiosError } from "@/services/authService";
import { currentUserState } from "@/store/authAtom"; // Ensure correct path
// Use the detailed type that includes nested objects
// OR Adjust import if PetDetailData is defined elsewhere
import { PetDetailData } from "@/types/petTypes";


// --- Get Base URL ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("VITE_API_BASE_URL loaded:", API_BASE_URL);

const PetDetailPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const currentUser = useRecoilValue(currentUserState);

  const [pet, setPet] = useState<PetDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!petId) {
      setError("Pet ID is missing.");
      toast.error("Invalid Pet ID.");
      setIsLoading(false);
      navigate("/browse-pets");
      return;
    }

    const fetchPetDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        
        const response = await getPetById(petId);
        console.log("Fetched Pet Details:", response.data); // Log details
        setPet(response.data||null);
      } catch (apiError) {
        console.error(`Failed to fetch pet ${petId}:`, apiError);
        let errorMsg = "Failed to load pet details.";
        if (isAxiosError(apiError) && apiError.response) {
          if (apiError.response.status === 404) {
            errorMsg = "Pet not found.";
            navigate("/browse-pets"); // Navigate away if pet doesn't exist
          } else {
            errorMsg = apiError.response.data?.message || errorMsg;
          }
        }
        setError(errorMsg);
        // Avoid toast if showing error component? Or make conditional
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetDetails();
  }, [petId, navigate]);

  // --- Helper to construct image URL safely ---
  const getFullImageUrl = (relativePath: string | null | undefined): string => {
    const placeholder = "/images/placeholder-pet.png";
    if (!relativePath) return placeholder;
    // Ensure API_BASE_URL is defined and doesn't end with a slash,
    // and relativePath starts with a slash for clean joining.
    if (!API_BASE_URL) {
      console.error("VITE_API_BASE_URL is not defined!");
      return placeholder;
    }
    // Basic sanity check for path format
    const cleanRelativePath = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;
    const cleanBaseUrl = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;

    return `${cleanBaseUrl}${cleanRelativePath}`;
    // Using URL constructor is slightly more robust but can fail on odd inputs
    // try { return new URL(relativePath, API_BASE_URL).href; } catch (e) { return placeholder; }
  };

  // --- Determine if the current viewer is the owner ---
  // Convert both IDs to Number for reliable comparison, handle potential string IDs
  const isOwner =
    currentUser && pet && Number(currentUser.id) === Number(pet.listedByUserId);

  // --- Delete Handler ---
  const handleDelete = async () => {
    if (!pet || !isOwner) {
      toast.error("You are not authorized to delete this listing.");
      return;
    }
    setIsDeleting(true);
    toast.info(`Deleting ${pet.name}...`);
    try {
      // Call the actual delete service function
      await deletePetById(pet.petId); // Pass correct ID
      toast.success(`${pet.name} has been removed from listings.`);
      navigate("/my-listings"); // Redirect after successful delete
    } catch (deleteError) {
      console.error("Delete failed:", deleteError);
      let errorMsg = "Failed to delete pet listing.";
      if (isAxiosError(deleteError) && deleteError.response) {
        errorMsg = deleteError.response.data?.message || errorMsg;
      }
      toast.error(errorMsg);
      setIsDeleting(false); // Only set back to false on error
    }
    // No finally needed - we navigate away on success
  };

   const handleRequestSubmitted = () => {
     console.log("Adoption request submitted callback triggered!");
     // You could potentially refetch pet data here if the request
     // submission should change something displayed on this page,
     // but likely not necessary for just submitting.
     // Maybe disable the request button after successful submission?
   };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pet) {
    // Added button to go back
    return (
      <div className="container text-center py-20">
        <AlertCircle className="mx-auto h-12 w-12 mb-3 text-destructive" />
        <p className="text-destructive font-medium">
          {error || "Pet data could not be loaded."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mt-5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Left Column: Image & Basic Info --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
              <AspectRatio ratio={1}>
                <img
                  src={getFullImageUrl(pet.imageUrl)}
                  alt={`Photo of ${pet.name}`}
                  className="object-cover w-full h-full bg-slate-100" // Added background
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder-pet.png";
                  }}
                />
              </AspectRatio>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-2xl mb-1">{pet.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-3 text-sm">
                {" "}
                {/* Use text-sm for badges */}
                <Badge variant="secondary">{pet.species}</Badge>
                {pet.breed && <Badge variant="outline">{pet.breed}</Badge>}
                <Badge variant="outline" className="capitalize">
                  {pet.gender?.toLowerCase()}
                </Badge>
                {pet.age !== null && pet.age !== undefined && (
                  <Badge variant="outline">{pet.age} year(s)</Badge>
                )}
                {pet.size && <Badge variant="outline">{pet.size}</Badge>}
                {pet.color && <Badge variant="outline">{pet.color}</Badge>}
                {pet.isVaccinated && (
                  <Badge variant="secondary">Vaccinated</Badge>
                )}
                {pet.isPottyTrained && (
                  <Badge variant="secondary">Potty Trained</Badge>
                )}
                {!pet.isVaccinated && (
                  <Badge variant="destructive">Not Vaccinated</Badge>
                )}
                {!pet.isPottyTrained && (
                  <Badge variant="destructive">Not Potty Trained</Badge>
                )}
              </div>
              <Badge
                variant={
                  pet.adoptionStatus === "Available" ? "default" : "secondary"
                }
                className="capitalize text-sm w-full justify-center py-1"
              >
                Status: {pet.adoptionStatus?.toLowerCase() ?? "Unknown"}
              </Badge>
            </CardContent>
          </Card>

          {/* --- Action Buttons --- */}
          {isOwner ? (
            // --- OWNER ACTIONS ---
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manage Listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/pets/edit/${pet.petId}`)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Pet Details
                </Button>
                {/* Delete Button with Confirmation Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete Listing
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete the listing for "{pet.name}". Associated
                        documents might also be removed (depending on backend
                        setup).
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start mt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}{" "}
                        Confirm Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            // --- ADOPTER ACTIONS ---
            <AdoptionRequestCard
              pet={pet} // Pass the fetched pet data
              currentUser={currentUser} // Pass the current user state
              onRequestSubmitted={handleRequestSubmitted} // Pass the optional callback
            />
          )}
        </div>

        {/* --- Right Column: Description, Documents, Lister Info --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About {pet.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {pet.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Lister Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Listed By
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Name */}
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">{pet.lister.name}</p>
              </div>

              {/* Contact Info if logged in */}
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {pet.lister.email}
                    </p>
                  </div>
                  {pet.lister.contactNumber && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {pet.lister.contactNumber}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-start gap-2 bg-amber-50/50 border border-amber-200 rounded p-3 text-sm text-muted-foreground italic">
                  <LockIcon className="w-4 h-4 mt-1 text-amber-400" />
                  <span>
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="underline font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <LogInIcon className="w-4 h-4" />
                      Log in
                    </Link>{" "}
                    to view contact details.
                  </span>
                </div>
              )}

              {/* Listing Date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDaysIcon className="w-4 h-4" />
                Listing Date: {new Date(pet.dateListed).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* TODO: Adoption Requests Section (Visible ONLY to Owner) */}
          {/* {isOwner && ( <Card> ... </Card> )} */}
        </div>
      </div>
    </div>
  );
};

export default PetDetailPage;
