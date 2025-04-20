// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { loginUser, isAxiosError } from "@/services/authService";
import { toast } from "react-toastify";
// Import your visual asset
import loginVisual from "@/assets/pets/pet_1.jpg"; // Adjust path/filename
import { authTokenState, currentUserState } from "@/store/authAtom";
import { useSetRecoilState } from "recoil";
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const setAuthToken = useSetRecoilState(authTokenState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const location = useLocation();
  const from = location.state?.from || "/dashboard";
    // Check for email verification success on load
    useEffect(() => {
      if (searchParams.get("verified") === "true") {
        toast.success("Email verified successfully! Please log in.");
        searchParams.delete("verified");
        setSearchParams(searchParams, { replace: true });
      }
    }, [searchParams, setSearchParams]);
   const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
  
      try {
        // --- Call Login API Service ---
        const response = await loginUser({ email, password });

        // --- Handle Success ---
        toast.success(response.message || "Login Successful!");

        // --- Store Token & User Data (Example using localStorage) ---
        // Adjust storage method if needed (sessionStorage, state management)
        if (response.data && response.data.token) {
          localStorage.setItem("authToken", response.data.token); 
          setAuthToken(response.data.token);
        
          // Store the full "Bearer <token>" string
          // Optionally store user info (excluding sensitive data like password)
          const userDataToStore = {
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
          };
          localStorage.setItem("userData", JSON.stringify(userDataToStore));
          setCurrentUser(userDataToStore);
          
          console.log("Token and user data stored.");
        } else {
          console.warn("Login response did not contain expected data/token.");
          // Handle this scenario if needed, though backend should always send it on success
        }

        // --- Navigate to Protected Area (e.g., dashboard or homepage) ---
        navigate(from,{replace: true}); // Or navigate('/dashboard');
      } catch (apiError) {
        console.error("Signup error:", apiError);

        if (isAxiosError(apiError) && apiError.response) {
          const { status, data } = apiError.response;

          // Handle 422 Unprocessable Entity - Validation errors
          if (status === 422 && typeof data === "object" && data.errors) {
            // Show all validation messages via toast
            Object.values(data.errors).forEach((message) => {
              if (Array.isArray(message)) {
                message.forEach((msg) => toast.error(msg));
              } else {
                toast.error(String(message));
              }
            });
          } else {
            // Generic error from backend with a message
            toast.error(data?.message || "Something went wrong.");
          }
        } else {
          // Non-API or network error
          toast.error(
            "Signup failed. Please check your network and try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      {/* Left Column */}
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center lg:p-8 xl:p-12 bg-gradient-to-br from-amber-100 to-orange-200">
        <img
          src={loginVisual}
          alt="Illustration of happy pets"
          className="mx-auto aspect-[3/4] max-w-md rounded-lg object-cover shadow-xl"
        />
      </div>
      {/* Right Column */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 lg:bg-none lg:bg-background">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Link to="/" className="inline-block mx-auto mb-2">
              <PawPrint className="h-10 w-10 text-primary" />
            </Link>
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login
            </p>
          </div>

          <form onSubmit={handleLogin} className="grid gap-4">
            {/* Email */}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
              />
            </div>
            {/* Password */}
            <div className="grid gap-1.5">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm underline text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {/* Submit Button */}
            <Button type="submit" className="w-full !mt-2" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  {" "}
                  {/* ... spinner ... */} Logging in...{" "}
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="underline text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


