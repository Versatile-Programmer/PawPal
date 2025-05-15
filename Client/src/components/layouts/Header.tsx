// src/components/layout/Header.tsx
import React from "react";
import { Button } from "@/components/ui/button"; // Adjust path
import { PawPrint, LogIn, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authTokenState, currentUserState, AuthUser } from "@/store/authAtom"; // Ensure correct path to atoms
import { useRecoilValue, useSetRecoilState } from "recoil";
import NotificationBell from "../notification/NotificationBell";

const Header: React.FC = () => {
  const setAuthToken = useSetRecoilState(authTokenState);
  const currentToken = useRecoilValue(authTokenState); // Use this to determine login status
  const setCurrentUser = useSetRecoilState(currentUserState);
  const currentUser: AuthUser | null = useRecoilValue(currentUserState); // Use this to display user info
  const navigate = useNavigate();

  // Removed navigateTo - directly use navigate or Link

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setAuthToken(null);
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Apply justify-between here to push logo left and auth block right */}
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        {/* --- Left Side: Logo and Brand --- */}
        {/* Removed padding from here, container handles it */}
        <Link className="flex items-center space-x-2" to="/">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">PawPal</span>
        </Link>
        {/* TODO: Add Navbar links here later (might go between logo and right side) */}
        {/* <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6"> ... links ... </nav> */}

        {/* --- Right Side: User Info / Auth Buttons --- */}
        {/* Group right-side elements */}
        <div className="flex items-center space-x-6 md:space-x-6">
          {currentToken && currentUser ? ( // Check both token and user data for logged-in state display
            <>
              {/* Consider adding a link to a profile/dashboard here */}
              {/* <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><User /></Button> */}
              <span /* ... Hello user ... */>Hello, {currentUser.name}!</span>
              <NotificationBell /> {/* <-- Add Notification Bell here */}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            // Logged out state
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
              >
                <LogIn className="mr-1.5 h-4 w-4" /> Login
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")}>
                <UserPlus className="mr-1.5 h-4 w-4" /> Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
