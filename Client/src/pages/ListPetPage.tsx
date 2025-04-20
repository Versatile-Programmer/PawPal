// src/pages/ListPetPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
// --- Service & Error Helper ---
import { createPetListingFormData } from "@/services/petService"; // Still use this service function
import { isAxiosError } from "@/services/authService"; // Error helper

// --- Frontend Types/Constants ---
import {
  PetGender,
  PetSize,
  genderOptions,
  sizeOptions,
} from "@/types/petTypes"; // Import local types/options

const ListPetPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // --- Form State using useState ---
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<PetGender | "">(""); // Use local enum type or empty string
  const [size, setSize] = useState<PetSize | "">(""); // Use local enum type or empty string
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [petImage, setPetImage] = useState<File | null>(null);
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isPottyTrained, setIsPottyTrained] = useState(false);

  // --- Field-specific errors from backend ---
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // --- File Change Handler ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPetImage(event.target.files[0]);
    } else {
      setPetImage(null);
    }
  };

  // --- Reset Form Function ---
  const resetForm = () => {
    setName("");
    setSpecies("");
    setBreed("");
    setAge("");
    setGender("");
    setSize("");
    setColor("");
    setDescription("");
    setPetImage(null);
    setFieldErrors({});
    // Reset file input visually (if needed, more complex)
    const fileInput = document.getElementById("petImage") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // --- Form Submit Handler ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setFieldErrors({}); // Clear previous field errors

    // --- Frontend Basic Checks (Optional but good UX) ---
    if (!name || !species || !gender) {
      toast.error(
        "Please fill in all required fields (Name, Species, Gender)."
      );
      setIsLoading(false);
      // Optionally set fieldErrors for these basic checks too
      setFieldErrors({
        name: !name ? "Name is required" : "",
        species: !species ? "Species is required" : "",
        gender: !gender ? "Gender is required" : "",
      });
      return;
    }
    // You could add more basic checks here (e.g., age format if desired)

    // --- Create FormData Object ---
    const dataToSend = new FormData();
    dataToSend.append("name", name);
    dataToSend.append("species", species);
    if (breed) dataToSend.append("breed", breed);
    if (age) dataToSend.append("age", age); // Send age as string
    if (gender) dataToSend.append("gender", gender); // Send selected enum value
    if (size) dataToSend.append("size", size); // Send selected enum value
    if (color) dataToSend.append("color", color);
    if (description) dataToSend.append("description", description);
    if (petImage) dataToSend.append("petImage", petImage);
    dataToSend.append("isVaccinated", String(isVaccinated));
    dataToSend.append("isPottyTrained", String(isPottyTrained));
    // --- Call API Service ---
    try {
      const response = await createPetListingFormData(dataToSend);
      toast.success(response.message || "Pet listed successfully!");
      resetForm(); // Clear form on success
      navigate("/my-listings");
    } catch (apiError) {
      console.error("Error submitting pet form:", apiError);
      if (isAxiosError(apiError) && apiError.response) {
        const status = apiError.response.status;
        const resData = apiError.response.data;

        if (status === 422 && resData?.errors) {
          // --- Handle Backend Validation Errors ---
          toast.error(
            resData.message || "Validation failed. Please check the fields."
          );
          // Map backend errors to fieldErrors state
          const errorsMap: Record<string, string> = {};
          Object.entries(resData.errors).forEach(([field, messages]) => {
            // Assuming messages is an array, take the first one
            if (Array.isArray(messages) && messages.length > 0) {
              errorsMap[field] = messages[0];
            } else if (typeof messages === "string") {
              errorsMap[field] = messages; // Handle if backend sends string directly
            }
          });
          setFieldErrors(errorsMap);
          console.error("Validation Errors:", resData.errors);
        } else {
          // General API error toast
          toast.error(
            resData?.message || "Failed to list pet. Please try again."
          );
        }
      } else {
        toast.error("An unexpected error occurred. Check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        List Your Pet for Adoption
      </h1>
      <Card className="max-w-3xl mx-auto border shadow-md">
        <CardHeader>
          <CardTitle>Pet Details</CardTitle>
          <CardDescription>
            Please provide accurate information about the pet.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="name">
                Pet's Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Buddy"
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            {/* Species */}
            <div className="grid gap-1.5">
              <Label htmlFor="species">
                Species <span className="text-red-500">*</span>
              </Label>
              <Input
                id="species"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="e.g., Dog, Cat"
                aria-invalid={!!fieldErrors.species}
              />
              {fieldErrors.species && (
                <p className="text-sm text-red-600">{fieldErrors.species}</p>
              )}
            </div>

            {/* Breed */}
            <div className="grid gap-1.5">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g., Golden Retriever, Siamese"
                aria-invalid={!!fieldErrors.breed}
              />
              {fieldErrors.breed && (
                <p className="text-sm text-red-600">{fieldErrors.breed}</p>
              )}
            </div>

            {/* Age */}
            <div className="grid gap-1.5">
              <Label htmlFor="age">Age (Years)</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 2"
                min="0"
                aria-invalid={!!fieldErrors.age}
              />
              {fieldErrors.age && (
                <p className="text-sm text-red-600">{fieldErrors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="grid gap-1.5">
              <Label htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value: PetGender) => setGender(value)}
                value={gender}
              >
                <SelectTrigger id="gender" aria-invalid={!!fieldErrors.gender}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.gender && (
                <p className="text-sm text-red-600">{fieldErrors.gender}</p>
              )}
            </div>

            {/* Size */}
            <div className="grid gap-1.5">
              <Label htmlFor="size">Size</Label>
              <Select
                onValueChange={(value: PetSize) => setSize(value)}
                value={size}
              >
                <SelectTrigger id="size" aria-invalid={!!fieldErrors.size}>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.size && (
                <p className="text-sm text-red-600">{fieldErrors.size}</p>
              )}
            </div>

            {/* Color */}
            <div className="grid gap-1.5">
              <Label htmlFor="color">Color(s)</Label>
              <Input
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Golden, Black & White"
                aria-invalid={!!fieldErrors.color}
              />
              {fieldErrors.color && (
                <p className="text-sm text-red-600">{fieldErrors.color}</p>
              )}
            </div>

            {/* Image File Input */}
            <div className="grid gap-1.5">
              <Label htmlFor="petImage">Pet Image</Label>
              <Input
                id="petImage"
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange} // Use specific handler
                className="pt-1.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {/* Displaying file validation errors from backend might be tricky */}
              {fieldErrors.petImage && (
                <p className="text-sm text-red-600">{fieldErrors.petImage}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-1.5 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about the pet's personality, habits, medical history (if any), etc."
                rows={5}
                aria-invalid={!!fieldErrors.description}
              />
              {fieldErrors.description && (
                <p className="text-sm text-red-600">
                  {fieldErrors.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVaccinated"
                checked={isVaccinated} // Your state variable
                onCheckedChange={(checked:any) => setIsVaccinated(Boolean(checked))} // Update state
              />
              <Label
                htmlFor="isVaccinated"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Vaccinated?
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPottyTrained"
                checked={isPottyTrained}
                onCheckedChange={(checked:any) =>
                  setIsPottyTrained(Boolean(checked))
                }
              />
              <Label
                htmlFor="isPottyTrained"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Potty Trained?
              </Label>
            </div>
          </CardContent>
          <Separator className="my-4" />
          <CardFooter className="pt-4 pb-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Add for Donation"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ListPetPage;
