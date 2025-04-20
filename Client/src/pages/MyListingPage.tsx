import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Link might not be needed if useNavigate used on div
import { useRecoilValue } from 'recoil';
import { toast } from 'react-toastify';

// --- UI Components ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription,  CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { AlertCircle, Loader2, PlusCircle, Dog } from 'lucide-react'; // Icons

// --- Service & State ---
import { getMyListings } from '@/services/petService'; // Service function
import { isAxiosError } from '@/services/authService';
import { authTokenState } from '@/store/authAtom'; // To check login status defensively
import { Pet} from '@/types/petTypes';

const MyListingsPage: React.FC = () => {
    const navigate = useNavigate();
    const token = useRecoilValue(authTokenState);
    const [myPets, setMyPets] = useState<Pet[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            // This check might be redundant due to ProtectedRoute, but safe
            setIsLoading(false);
            setError("Authentication required.");
            toast.error("Please log in to view your listings.");
            navigate('/login');
            return;
        }

        const fetchMyPets = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getMyListings();
                setMyPets(response.data || []);
            } catch (apiError) {
                console.error("Failed to fetch listings:", apiError);
                let errorMsg = "Failed to load your pet listings.";
                 if (isAxiosError(apiError) && apiError.response) {
                     errorMsg = apiError.response.data?.message || errorMsg;
                 }
                 setError(errorMsg);
                 toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyPets();
    }, []); // Dependencies

    // --- Card Click Handler ---
    const handleCardClick = (petId: BigInt | number | string) => {
        // Convert BigInt to string for URL parameter
        const petIdString = String(petId);
        console.log(`Navigating to manage page for pet ID: ${petIdString}`);
        navigate(`/pets/manage/${petIdString}`); // Navigate to the specific manage page
    };


    // --- Render Logic ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading your pets...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 text-red-600">
                    <AlertCircle className="mx-auto h-10 w-10 mb-2" />
                    <p>{error}</p>
                    {/* Optionally add a retry button that calls fetchMyPets() */}
                </div>
            );
        }

        if (!myPets || myPets.length === 0) {
            return (
                <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <Dog className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Pets Listed Yet</h2>
                    <p className="text-muted-foreground mb-4">Ready to find a home for your furry friend?</p>
                    <Button onClick={() => navigate('/pets/new')}>
                       <PlusCircle className="mr-2 h-4 w-4" /> List Your First Pet
                    </Button>
                </div>
            );
        }

        // --- Display Pet Cards ---
        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"> {/* Adjusted grid columns */}
                 {myPets.map((pet) => (
                    // Make the Card clickable
                     <Card
                        key={pet.petId.toString()}
                        className="overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer flex flex-col"
                        onClick={() => handleCardClick(pet.petId)} // Add onClick handler
                        role="link" // Accessibility hint
                        aria-label={`Manage details for ${pet.name}`}
                     >
                         <CardHeader className="p-0 relative"> {/* Relative for potential overlay later */}
                             <AspectRatio ratio={1}> {/* Square aspect ratio for consistency */}
                                 <img
                                     // Construct full URL if path is relative - Adjust VITE_API_BASE_URL if needed
                                     src={pet.imageUrl ? `${import.meta.env.VITE_API_BASE_URL || ''}${pet.imageUrl}` : '/images/placeholder-pet.png'}
                                     alt={`Photo of ${pet.name}`}
                                     className="object-cover w-full h-full"
                                     loading="lazy" // Lazy load images
                                     onError={(e) => { e.currentTarget.src = '/images/placeholder-pet.png'; }}
                                 />
                             </AspectRatio>
                              <Badge variant={pet.adoptionStatus === 'Available' ? 'default' : 'secondary'} className="capitalize absolute top-2 right-2 text-xs">
                                 {pet.adoptionStatus.toLowerCase()}
                              </Badge>
                         </CardHeader>
                         <CardContent className="p-3 flex-grow"> {/* Slightly less padding */}
                             <CardTitle className="text-base font-semibold line-clamp-1 mb-0.5">{pet.name}</CardTitle> {/* Smaller title */}
                             <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                                 {pet.species} {pet.breed ? `- ${pet.breed}` : ''}
                             </CardDescription>
                         </CardContent>
                         {/* Removed CardFooter - click action is on the whole card */}
                     </Card>
                 ))}
             </div>
        );
    };


    return (
        <div className="container px-4 md:px-6 py-8 md:py-12">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">My Pet Listings</h1>
                 {myPets && myPets.length > 0 && (
                    <Button size="sm" onClick={() => navigate('/pets/new')}>
                       <PlusCircle className="mr-2 h-4 w-4" /> List Another Pet
                    </Button>
                 )}
             </div>
             {renderContent()}
        </div>
    );
};

export default MyListingsPage;