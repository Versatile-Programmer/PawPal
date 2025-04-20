// src/pages/SignupPage.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { toast } from "react-toastify";
// Import your visual asset (could be the same or different from login)
import signupVisual from "@/assets/pets/pet_5.jpg"; // Adjust path/filename
import { registerUser,isAxiosError} from '@/services/authService';
const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

 

const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Frontend Validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match."); // Use toast for this general validation
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long."); // Use toast
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser({ fullName, email,contactNumber, password,confirmPassword });

      // --- Handle Success ---
      toast.success(
        response.message || "Check your email to verify your account!"
      ); // Display success toast

      // Clear form on success
      setFullName("");
      setEmail("");
      setContactNumber("");
      setPassword("");
      setConfirmPassword("");

      // Don't redirect automatically. User needs to check email.
    } catch (apiError) {
      // --- Handle Errors using Toast ---
     console.error("Signup component error handler:", apiError);

     if (isAxiosError(apiError)) {
       const data = apiError.response?.data;

       // Show generic message
       toast.error(data?.message || "Signup failed.");

       // Handle field-specific validation errors
       const fieldErrors = data?.errors;
       if (fieldErrors && typeof fieldErrors === "object") {
         Object.entries(fieldErrors).forEach(([field, message]) => {
           if (typeof message === "string") {
             toast.error(`${field}: ${message}`);
           }
         });
       }
     } else {
       toast.error("Signup failed. Check your network connection.");
     } // Non-API error toas
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      {/* Left Column: Visual */}
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center lg:p-8 xl:p-12 bg-gradient-to-br from-sky-100 to-blue-200">
        <img
          src={signupVisual}
          alt="Illustration of people adopting pets"
          className="mx-auto aspect-[3/4] max-w-md rounded-lg object-cover shadow-xl"
        />
      </div>

      {/* Right Column: Signup Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 lg:bg-none lg:bg-background">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <Link to="/" className="inline-block mx-auto mb-2">
              <PawPrint className="h-10 w-10 text-primary" />
            </Link>
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>

          <form onSubmit={handleSignup} className="grid gap-4">
            {/* Full Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="Ada Lovelace"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            {/* Email */}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* Contact Number */}
            <div className="grid gap-1.5">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="123-456-7890"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
            {/* Password */}
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (min. 8)"
              />
            </div>
            {/* Confirm Password */}
            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {/* Submit Button */}
            <Button type="submit" className="w-full !mt-4" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  {" "}
                  {/* ... spinner ... */} Creating Account...{" "}
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          {/* Link to Login */}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline text-primary hover:text-primary/80"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
