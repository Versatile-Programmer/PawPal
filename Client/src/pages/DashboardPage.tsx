// src/pages/DashboardPage.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRecoilValue } from "recoil";
import { currentUserState } from "@/store/authAtom"; // Import user state
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search, List, Send } from "lucide-react"; // Import icons

const DashboardPage: React.FC = () => {
  const currentUser = useRecoilValue(currentUserState); // Get logged-in user info
  const navigate = useNavigate();

  // Fallback if currentUser state isn't populated somehow (shouldn't happen with ProtectedRoute)
  if (!currentUser) {
    // Optional: Could navigate back to login or show an error/loading state
    // navigate('/login'); // Or render a loading/error component
    return <div className="container py-8">Loading user data...</div>;
  }

  return (
    // Use container for padding and centering content within MainLayout's main area
    <div className="container py-8 md:py-12 px-4 md:px-15">
      {/* --- Welcome Section --- */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
          Welcome back, {currentUser.name}!
        </h1>
        <p className="text-lg text-muted-foreground">
          What would you like to do today?
        </p>
      </div>

      <Separator className="mb-8" />

      {/* --- Primary Actions Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Card 1: List a Pet */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <PlusCircle className="w-6 h-6 mr-2 text-primary" />
              List a Pet for Adoption
            </CardTitle>
            <CardDescription>
              Ready to find a loving new home for your furry friend?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Provide details and photos to connect with potential adopters.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full md:w-auto"
              onClick={() => navigate("/pets/new")}
            >
              {" "}
              {/* TODO: Create '/pets/new' page */}
              List a Pet
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2: Browse Pets */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Search className="w-6 h-6 mr-2 text-primary" />
              Find Your New Companion
            </CardTitle>
            <CardDescription>
              Browse available pets waiting for their forever home.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Filter by species, breed, age, and more to find your perfect
              match.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full md:w-auto"
              onClick={() => navigate("/browse-pets")}
            >
              {" "}
              {/* TODO: Create '/browse-pets' page */}
              Browse Pets
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* --- (Optional) Quick Access / Summary Sections --- */}
      {/* These sections will require backend data later */}
      <h2 className="text-2xl font-semibold tracking-tight text-gray-800 mb-4">
        Quick Access
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example: My Listings Card */}
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <List className="w-5 h-5 mr-2 text-muted-foreground" />
              My Pet Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Fetch count/preview from backend */}
            <p className="text-sm text-muted-foreground">
              View and manage the pets you have listed.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/my-listings")}
            >
              {" "}
              {/* TODO: Create '/my-listings' */}
              View Listings
            </Button>
          </CardFooter>
        </Card>

        {/* Example: My Adoption Requests Card */}
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Send className="w-5 h-5 mr-2 text-muted-foreground" />
              My Adoption Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Fetch count/preview from backend */}
            <p className="text-sm text-muted-foreground">
              Track requests you've sent or received.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/my-requests")}
            >
              {" "}
              {/* TODO: Create '/my-requests' */}
              View Requests
            </Button>
          </CardFooter>
        </Card>

        {/* Example: Notifications Card (Placeholder) */}
        {/* Add more cards as needed, e.g., Notifications */}
      </div>
    </div>
  );
};

export default DashboardPage;
