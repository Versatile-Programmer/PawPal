// src/pages/BrowsePetsPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// --- UI Components ---
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AlertCircle, Loader2, Search } from "lucide-react"; // Icons
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Shadcn Pagination

// --- Service & Types ---
import {
  browseAvailablePets
} from "@/services/petService"; // Service function
import { isAxiosError } from "@/services/authService";
import { BrowsePetData,PaginationInfo } from "@/types/petTypes";
// --- Base URL for Images ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BrowsePetsPage: React.FC = () => {
  const navigate = useNavigate();

  const [pets, setPets] = useState<BrowsePetData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Memoized Fetch Function ---
  // useCallback ensures this function reference doesn't change on every render
  // unless currentPage changes, preventing potential infinite loops if used in useEffect dependency
  const fetchPets = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching page ${page}`);
    try {
      const response = await browseAvailablePets(page);
      setPets(response.data || []);
      setPagination(response.pagination || null);
    } catch (apiError) {
      console.error(`Failed to fetch pets page ${page}:`, apiError);
      let errorMsg = "Failed to load available pets.";
      if (isAxiosError(apiError) && apiError.response) {
        errorMsg = apiError.response.data?.message || errorMsg;
      }
      setError(errorMsg);
      toast.error(errorMsg); // Show toast on error
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed for the function definition itself

  // --- Effect to Fetch Data on Page Change ---
  useEffect(() => {
    fetchPets(currentPage);
  }, [currentPage, fetchPets]); // Re-run effect when currentPage or fetchPets changes

  // --- Pagination Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0); // Scroll to top on page change
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

  // --- Render Logic ---
  const renderPetCards = () => {
    if (!pets || pets.length === 0) {
      return (
        <div className="col-span-full text-center py-16 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
          <Search className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Pets Found</h2>
          <p className="text-muted-foreground">
            No available pets match the current filters. Check back later!
          </p>
        </div>
      );
    }

    return pets.map((pet) => {
      const imageUrl = getFullImageUrl(pet.imageUrl);
      return (
        <Card
          key={String(pet.petId)}
          className="overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer flex flex-col"
          onClick={() => navigate(`/pets/manage/${String(pet.petId)}`)} // Link to public detail page
          role="link"
          aria-label={`View details for ${pet.name}`}
        >
          <CardHeader className="p-0 relative">
            <AspectRatio ratio={1}>
              <img
                src={imageUrl}
                alt={`Photo of ${pet.name}`}
                className="object-cover w-full h-full bg-slate-100"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder-pet.png";
                }}
              />
            </AspectRatio>
            {/* Removed badge - status is always 'Available' here */}
          </CardHeader>
          <CardContent className="p-3 flex-grow">
            <CardTitle className="text-base font-semibold line-clamp-1 mb-0.5">
              {pet.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground line-clamp-1">
              {pet.species} {pet.breed ? `- ${pet.breed}` : ""}
            </CardDescription>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Find Your New Friend
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse through pets currently available for adoption. Click on a pet
          to learn more.
        </p>
        {/* TODO: Add Filtering/Search Controls here later */}
      </div>

      {/* Content Area */}
      {isLoading && !pets.length ? ( // Show full page loader only on initial load
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">
          <AlertCircle className="mx-auto h-12 w-12 mb-3" />
          <p>{error}</p>
          {/* Optional Retry Button */}
          <Button
            variant="outline"
            onClick={() => fetchPets(currentPage)}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      ) : (
        // Grid for Pet Cards
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5 mb-10">
          {" "}
          {/* Max 4 wide looks good */}
          {renderPetCards()}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#" // Prevent default link behavior
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {/* Display page numbers (basic example) */}
            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Add logic here for ellipsis if too many pages
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                aria-disabled={currentPage >= pagination.totalPages}
                className={
                  currentPage >= pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default BrowsePetsPage;
