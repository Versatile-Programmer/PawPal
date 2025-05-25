// import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// // --- UI Components ---
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

// // --- Service, State & Types ---
// import { getPetById,updatePetDetails } from "@/services/petService";
// // import { PetDetailData } from "@/services/petService"; // Type for fetched pet (ensure this is defined in petService.ts or imported from types)
// import { isAxiosError } from "@/services/authService";
// import { PetGender, PetSize } from "@/types/petTypes"; // Your local frontend enums
// import { useRecoilValue } from "recoil";
// import { currentUserState } from "@/store/authAtom"; // Ensure correct path and AuthUser type

// // --- Get Base URL ---
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // Your frontend form data structure
// export interface PetEditFormData {
//   name: string;
//   species: string;
//   breed: string;
//   age: string;
//   gender: PetGender | "";
//   size: PetSize | "";
//   color: string;
//   description: string;
//   isVaccinated: boolean;
//   isPottyTrained: boolean;
//   petImage?: File | null;
// }

// // Define a unique string for the "None" option that won't clash with actual enum values
// const NONE_SELECTED_VALUE = "___NONE___"; // Generic for any "none" select item

// const EditPetPage: React.FC = () => {
//   const { petId } = useParams<{ petId: string }>();
//   const navigate = useNavigate();
//   const currentUser = useRecoilValue(currentUserState);

//   const [formData, setFormData] = useState<PetEditFormData>({
//     name: "",
//     species: "",
//     breed: "",
//     age: "",
//     gender: "",
//     size: "",
//     color: "",
//     description: "",
//     isVaccinated: false,
//     isPottyTrained: false,
//     petImage: null,
//   });

//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
//   const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
//   const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!petId) {
//       toast.error("Invalid Pet ID.");
//       navigate("/my-listings");
//       return;
//     }
//     const fetchPet = async () => {
//       setIsLoading(true);
//       setInitialLoadError(null);
//       try {
//         const response = await getPetById(petId);
//         const petData = response.data;

//         if (!petData) {
//           // Handle case where petData might be null/undefined from service
//           throw new Error("Pet data not found.");
//         }

//         // Ownership check
//         if (petData.listedByUserId !== currentUser?.id) {
//           toast.error("You are not authorized to edit this pet listing.");
//           navigate("/my-listings");
//           return;
//         }

//         setFormData({
//           name: petData.name || "",
//           species: petData.species || "",
//           breed: petData.breed || "",
//           age: petData.age?.toString() || "",
//           gender: petData.gender || "", // Backend should send valid PetGender or null
//           size: petData.size || "", // Backend should send valid PetSize or null
//           color: petData.color || "",
//           description: petData.description || "",
//           isVaccinated: petData.isVaccinated || false,
//           isPottyTrained: petData.isPottyTrained || false,
//           petImage: null,
//         });
//         setCurrentImageUrl(
//           petData.imageUrl ? getFullImageUrl(petData.imageUrl) : null
//         );
//       } catch (apiError) {
//         console.error("Failed to fetch pet details for editing:", apiError);
//         let errorMsg = "Could not load pet details.";
//         if (isAxiosError(apiError) && apiError.response?.status === 404) {
//           errorMsg = "Pet not found.";
//         } else if (isAxiosError(apiError) && apiError.response?.data?.message) {
//           errorMsg = apiError.response.data.message;
//         }
//         setInitialLoadError(errorMsg);
//         toast.error(errorMsg);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchPet();
//   }, [petId, navigate, currentUser]);

//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (name: keyof PetEditFormData, value: string) => {
//     if (value === NONE_SELECTED_VALUE) {
//       setFormData((prev) => ({ ...prev, [name]: "" })); // Set to empty string for "no selection"
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleCheckboxChange = (
//     name: keyof PetEditFormData,
//     checked: boolean
//   ) => {
//     setFormData((prev) => ({ ...prev, [name]: checked }));
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setFormData((prev) => ({ ...prev, petImage: file }));
//       if (newImagePreview) URL.revokeObjectURL(newImagePreview);
//       setNewImagePreview(URL.createObjectURL(file));
//     } else {
//       setFormData((prev) => ({ ...prev, petImage: null }));
//       if (newImagePreview) URL.revokeObjectURL(newImagePreview);
//       setNewImagePreview(null);
//     }
//   };

//   const getFullImageUrl = (relativePath: string | null | undefined): string => {
//     const placeholder = "/images/placeholder-pet.png";
//     if (!relativePath || !API_BASE_URL) return placeholder;
//     try {
//       return new URL(relativePath, API_BASE_URL).href;
//     } catch (e) {
//       return placeholder;
//     }
//   };

//   const handleSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!petId) return;

//     setIsUpdating(true);
//     const dataToSend = new FormData();

//     dataToSend.append("name", formData.name);
//     dataToSend.append("species", formData.species);
//     // Only append optional fields if they have a value (not empty string)
//     if (formData.breed) dataToSend.append("breed", formData.breed);
//     if (formData.age) dataToSend.append("age", formData.age);
//     if (formData.gender) dataToSend.append("gender", formData.gender);
//     if (formData.size) dataToSend.append("size", formData.size); // Empty string will not be appended
//     if (formData.color) dataToSend.append("color", formData.color);
//     if (formData.description)
//       dataToSend.append("description", formData.description);
//     dataToSend.append("isVaccinated", String(formData.isVaccinated));
//     dataToSend.append("isPottyTrained", String(formData.isPottyTrained));

//     if (formData.petImage) {
//       dataToSend.append("petImage", formData.petImage);
//     }

//     try {
//       const response = await updatePetDetails(petId, dataToSend);
//       toast.success(response.message || "Pet details updated successfully!");
//       if (response.data?.imageUrl) {
//         setCurrentImageUrl(getFullImageUrl(response.data.imageUrl));
//       }
//       // Reset only the file input part of the form state after successful update
//       setFormData((prev) => ({ ...prev, petImage: null }));
//       setNewImagePreview(null);
//       // Optionally update other formData fields with response.data if needed to reflect backend processing
//       // For example, if backend cleans up breed: setFormData(prev => ({ ...prev, breed: response.data.breed || "" }))
//       // Or navigate away
//       navigate(`/pets/${petId}`); // Navigate back to the detail/view page
//     } catch (apiError: any) {
//       console.error("Error updating pet:", apiError);
//       let errorMsg = "Failed to update pet details.";
//       if (isAxiosError(apiError) && apiError.response) {
//         errorMsg = apiError.response.data?.message || errorMsg;
//         if (apiError.response.data?.errors) {
//           console.log(
//             "Backend validation errors:",
//             apiError.response.data.errors
//           );
//           // TODO: Implement logic to display these field-specific errors
//           // Example:
//           // const backendErrors = apiError.response.data.errors;
//           // let fieldErrorMessages = "";
//           // for (const field in backendErrors) {
//           //    fieldErrorMessages += `${field}: ${backendErrors[field].join(', ')}\n`;
//           // }
//           // toast.error(<>Validation Failed:<br/><pre>{fieldErrorMessages}</pre></>);
//         }
//       }
//       toast.error(errorMsg);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="container flex justify-center items-center py-20">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     );
//   }
//   if (initialLoadError) {
//     return (
//       <div className="container text-center py-20 text-red-600">
//         <AlertCircle className="mx-auto h-12 w-12 mb-3" />
//         <p>{initialLoadError}</p>
//       </div>
//     );
//   }
//   // A more robust check for successful data load before rendering form
//   if (!isLoading && !initialLoadError && !formData.name && petId) {
//     return (
//       <div className="container text-center py-20 text-muted-foreground">
//         <p>Pet data not available or you might not be authorized.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container px-4 md:px-6 py-8 md:py-12">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() =>
//           navigate(initialLoadError ? "/my-listings" : `/pets/${petId}`)
//         }
//         className="mb-6"
//       >
//         <ArrowLeft className="mr-2 h-4 w-4" />{" "}
//         {initialLoadError ? "Back to Listings" : "Cancel Edit"}
//       </Button>
//       <h1 className="text-3xl font-bold tracking-tight mb-6">
//         Edit Pet: {formData.name || "Loading..."}
//       </h1>

//       <Card className="max-w-3xl mx-auto border shadow-md">
//         <form onSubmit={handleSubmitForm} encType="multipart/form-data">
//           <CardHeader>
//             <CardTitle>Update Pet Information</CardTitle>
//             <CardDescription>
//               Make changes and save to update the listing.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
//             {/* Column 1 */}
//             <div className="space-y-4">
//               <div className="grid gap-1.5">
//                 <Label htmlFor="name">
//                   Pet's Name <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="e.g., Buddy"
//                   required
//                 />
//               </div>
//               <div className="grid gap-1.5">
//                 <Label htmlFor="species">
//                   Species <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="species"
//                   name="species"
//                   value={formData.species}
//                   onChange={handleChange}
//                   placeholder="e.g., Dog, Cat"
//                   required
//                 />
//               </div>
//               <div className="grid gap-1.5">
//                 <Label htmlFor="breed">Breed</Label>
//                 <Input
//                   id="breed"
//                   name="breed"
//                   value={formData.breed}
//                   onChange={handleChange}
//                   placeholder="e.g., Golden Retriever"
//                 />
//               </div>
//               <div className="grid gap-1.5">
//                 <Label htmlFor="age">Age (Years)</Label>
//                 <Input
//                   id="age"
//                   name="age"
//                   type="number"
//                   value={formData.age}
//                   onChange={handleChange}
//                   placeholder="e.g., 2"
//                   min="0"
//                 />
//               </div>
//               <div className="grid gap-1.5">
//                 <Label>Current Image</Label>
//                 {currentImageUrl &&
//                 currentImageUrl !== "/images/placeholder-pet.png" ? (
//                   <img
//                     src={currentImageUrl}
//                     alt="Current pet"
//                     className="w-32 h-32 object-cover rounded-md border"
//                   />
//                 ) : (
//                   <p className="text-sm text-muted-foreground">
//                     No current image.
//                   </p>
//                 )}
//               </div>
//               <div className="grid gap-1.5">
//                 <Label htmlFor="petImage">Change Image (Optional)</Label>
//                 <div className="flex items-center gap-4">
//                   <Input
//                     id="petImage"
//                     name="petImage"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                     className="pt-1.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
//                   />
//                   {newImagePreview && (
//                     <img
//                       src={newImagePreview}
//                       alt="New image preview"
//                       className="w-20 h-20 object-cover rounded-md border"
//                     />
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Column 2 */}
//             <div className="space-y-4">
//               <div className="grid gap-1.5">
//                 <Label htmlFor="gender">
//                   Gender <span className="text-red-500">*</span>
//                 </Label>
//                 <Select
//                   value={formData.gender}
//                   onValueChange={(value) =>
//                     handleSelectChange("gender", value as PetGender)
//                   }
//                 >
//                   <SelectTrigger id="gender">
//                     <SelectValue placeholder="Select gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Object.values(PetGender).map((g) => (
//                       <SelectItem key={g} value={g}>
//                         {g}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid gap-1.5">
//                 <Label htmlFor="size">Size</Label>
//                 <Select
//                   value={formData.size || NONE_SELECTED_VALUE} // If formData.size is "", select "None"
//                   onValueChange={(value) =>
//                     handleSelectChange("size", value as string)
//                   }
//                 >
//                   <SelectTrigger id="size">
//                     <SelectValue placeholder="Select size (optional)" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value={NONE_SELECTED_VALUE}>
//                       -- None --
//                     </SelectItem>
//                     {Object.values(PetSize).map((s) => (
//                       <SelectItem key={s} value={s}>
//                         {s}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid gap-1.5">
//                 <Label htmlFor="color">Color(s)</Label>
//                 <Input
//                   id="color"
//                   name="color"
//                   value={formData.color}
//                   onChange={handleChange}
//                   placeholder="e.g., Golden, Black & White"
//                 />
//               </div>
//               <div className="grid gap-1.5">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   placeholder="Tell us about the pet..."
//                   rows={5}
//                 />
//               </div>
//               <div className="flex items-center space-x-2 pt-2">
//                 <Checkbox
//                   id="isVaccinated"
//                   checked={formData.isVaccinated}
//                   onCheckedChange={(checked) =>
//                     handleCheckboxChange("isVaccinated", Boolean(checked))
//                   }
//                 />
//                 <Label htmlFor="isVaccinated">Vaccinated?</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="isPottyTrained"
//                   checked={formData.isPottyTrained}
//                   onCheckedChange={(checked) =>
//                     handleCheckboxChange("isPottyTrained", Boolean(checked))
//                   }
//                 />
//                 <Label htmlFor="isPottyTrained">Potty Trained?</Label>
//               </div>
//             </div>
//           </CardContent>
//           <Separator className="my-4" />
//           <CardFooter className="pt-4 pb-6">
//             <Button
//               type="submit"
//               disabled={isUpdating}
//               className="w-full md:w-auto"
//             >
//               {isUpdating ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
//                   Changes...
//                 </>
//               ) : (
//                 "Save Changes"
//               )}
//             </Button>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default EditPetPage;

// ---------------------------------------------------------------------------------------------------------------------------------
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

// --- Service, State & Types ---
import { getPetById, updatePetDetails } from "@/services/petService";
// import { Pet } from "@/types/petTypes";
import { isAxiosError } from "@/services/authService";
import { PetGender, PetSize } from "@/types/petTypes";
import { useRecoilValue } from "recoil";
import { currentUserState } from "@/store/authAtom"; // Ensure correct path

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface PetEditFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: PetGender | "";
  size: PetSize | "";
  color: string;
  description: string;
  isVaccinated: boolean;
  isPottyTrained: boolean;
  petImage?: File | null;
}

const NONE_SELECTED_VALUE = "___NONE___";

const EditPetPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const currentUser = useRecoilValue(currentUserState); // This is AuthUser | null

  const [formData, setFormData] = useState<PetEditFormData>({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    color: "",
    description: "",
    isVaccinated: false,
    isPottyTrained: false,
    petImage: null,
  });

  // // No need for separate initialPetData state if form is populated directly
  // const [initialPetData, setInitialPetData] = useState<PetDetailData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!petId) {
      toast.error("Invalid Pet ID.");
      navigate("/my-listings");
      return;
    }
    const fetchPet = async () => {
      setIsLoading(true);
      setInitialLoadError(null);
      try {
        const response = await getPetById(petId);
        const petData = response.data;

        if (!petData) {
          throw new Error("Pet data not found from API.");
        }

        // --- Corrected Ownership Check ---
        // Ensure currentUser exists and then compare IDs.
        // petData.listedByUserId from backend is likely BigInt or string representation of BigInt.
        // currentUser.id from Recoil/JWT is likely number.
        if (
          !currentUser ||
          String(petData.listedByUserId) !== String(currentUser.id)
        ) {
          toast.error("You are not authorized to edit this pet listing.");
          navigate("/my-listings");
          setIsLoading(false); // Stop loading if redirecting
          return;
        }
        // --- End Corrected Ownership Check ---

        // setInitialPetData(petData); // Store original if needed for other comparisons later, but not for form itself
        setFormData({
          name: petData.name || "",
          species: petData.species || "",
          breed: petData.breed || "",
          age: petData.age?.toString() || "",
          gender: petData.gender || "",
          size: petData.size || "",
          color: petData.color || "",
          description: petData.description || "",
          isVaccinated: petData.isVaccinated || false,
          isPottyTrained: petData.isPottyTrained || false,
          petImage: null,
        });
        setCurrentImageUrl(
          petData.imageUrl ? getFullImageUrl(petData.imageUrl) : null
        );
      } catch (apiError: any) {
        // Catch any error type
        console.error("Failed to fetch pet details for editing:", apiError);
        let errorMsg = apiError.message || "Could not load pet details."; // Use error.message if available
        if (isAxiosError(apiError) && apiError.response) {
          if (apiError.response.status === 404) errorMsg = "Pet not found.";
          else if (apiError.response.data?.message)
            errorMsg = apiError.response.data.message;
        }
        setInitialLoadError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPet();
  }, [petId, navigate, currentUser]); // currentUser is a dependency for ownership check

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof PetEditFormData, value: string) => {
    if (value === NONE_SELECTED_VALUE) {
      setFormData((prev) => ({ ...prev, [name]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (
    name: keyof PetEditFormData,
    checked: boolean
  ) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, petImage: file }));
      if (newImagePreview) URL.revokeObjectURL(newImagePreview);
      setNewImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, petImage: null }));
      if (newImagePreview) URL.revokeObjectURL(newImagePreview);
      setNewImagePreview(null);
    }
  };

  const getFullImageUrl = (relativePath: string | null | undefined): string => {
    const placeholder = "/images/placeholder-pet.png";
    if (!relativePath || !API_BASE_URL) return placeholder;
    try {
      return new URL(relativePath, API_BASE_URL).href;
    } catch (e) {
      console.error("Error creating full image URL:", e);
      return placeholder;
    }
  };

  const handleSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!petId) return;

    setIsUpdating(true);
    const dataToSend = new FormData();

    dataToSend.append("name", formData.name);
    dataToSend.append("species", formData.species);
    if (formData.breed) dataToSend.append("breed", formData.breed);
    if (formData.age) dataToSend.append("age", formData.age);
    if (formData.gender) dataToSend.append("gender", formData.gender);
    if (formData.size) dataToSend.append("size", formData.size);
    if (formData.color) dataToSend.append("color", formData.color);
    if (formData.description)
      dataToSend.append("description", formData.description);
    dataToSend.append("isVaccinated", String(formData.isVaccinated));
    dataToSend.append("isPottyTrained", String(formData.isPottyTrained));
    if (formData.petImage) dataToSend.append("petImage", formData.petImage);

    try {
      const response = await updatePetDetails(petId, dataToSend);
      toast.success(response.message || "Pet details updated successfully!");
      if (response.data?.imageUrl) {
        setCurrentImageUrl(getFullImageUrl(response.data.imageUrl));
      }
      setFormData((prev) => ({ ...prev, petImage: null }));
      setNewImagePreview(null);
      navigate(`/pets/manage/${petId}`);
    } catch (apiError: any) {
      console.error("Error updating pet:", apiError);
      let errorMsg = "Failed to update pet details.";
      if (isAxiosError(apiError) && apiError.response) {
        errorMsg = apiError.response.data?.message || errorMsg;
        if (apiError.response.data?.errors) {
          console.log(
            "Backend validation errors:",
            apiError.response.data.errors
          );
          // TODO: Implement field-specific error display if needed
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (initialLoadError) {
    return (
      <div className="container text-center py-20 text-red-600">
        <AlertCircle className="mx-auto h-12 w-12 mb-3" />
        <p>{initialLoadError}</p>
      </div>
    );
  }
  // Check if formData.name is still empty AND no initial load error AND not loading
  // This implies data wasn't fetched correctly OR ownership check failed and redirected
  // This condition might not be hit if ownership check redirects immediately.
  if (!isLoading && !initialLoadError && !petId) {
    return (
      <div className="container text-center py-20 text-muted-foreground">
        <p>Pet data not available or you are not authorized.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          navigate(initialLoadError ? "/my-listings" : `/pets/manage/${petId}`)
        }
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />{" "}
        {initialLoadError ? "Back to Listings" : "Cancel Edit"}
      </Button>
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Edit Pet: {formData.name || "Loading..."}
      </h1>

      <Card className="max-w-3xl mx-auto border shadow-md">
        <form onSubmit={handleSubmitForm} encType="multipart/form-data">
          <CardHeader>
            <CardTitle>Update Pet Information</CardTitle>
            <CardDescription>
              Make changes and save to update the listing.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">
                  Pet's Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Buddy"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="species">
                  Species <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  placeholder="e.g., Dog, Cat"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g., Golden Retriever"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="age">Age (Years)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  min="0"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Current Image</Label>
                {currentImageUrl &&
                currentImageUrl !== "/images/placeholder-pet.png" ? (
                  <img
                    src={currentImageUrl}
                    alt="Current pet"
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No current image.
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="petImage">Change Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="petImage"
                    name="petImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="pt-1.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {newImagePreview && (
                    <img
                      src={newImagePreview}
                      alt="New image preview"
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="gender">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    handleSelectChange("gender", value as PetGender)
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PetGender).map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="size">Size</Label>
                <Select
                  value={formData.size || NONE_SELECTED_VALUE}
                  onValueChange={(value) =>
                    handleSelectChange("size", value as string)
                  }
                >
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_SELECTED_VALUE}>
                      -- None --
                    </SelectItem>
                    {Object.values(PetSize).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="color">Color(s)</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Golden, Black & White"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about the pet..."
                  rows={5}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isVaccinated"
                  checked={formData.isVaccinated}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("isVaccinated", Boolean(checked))
                  }
                />
                <Label htmlFor="isVaccinated">Vaccinated?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPottyTrained"
                  checked={formData.isPottyTrained}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("isPottyTrained", Boolean(checked))
                  }
                />
                <Label htmlFor="isPottyTrained">Potty Trained?</Label>
              </div>
            </div>
          </CardContent>
          <Separator className="my-4" />
          <CardFooter className="pt-4 pb-6">
            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full md:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                  Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditPetPage;