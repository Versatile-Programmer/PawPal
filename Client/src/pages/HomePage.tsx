import React from "react";
// Shadcn UI Components
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio"; // Adjust path if needed
// Icons


// Import your static images (adjust paths and filenames as needed)
import petImage1 from "@/assets/pets/pet_1.jpg";
import petImage2 from "@/assets/pets/pet_2.jpg";
import petImage3 from "@/assets/pets/pet_3.jpg";
import petImage4 from "@/assets/pets/pet_4.jpg";
import petImage5 from "@/assets/pets/pet_5.jpg";
import petImage6 from "@/assets/pets/pet_6.jpg";


import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
const HomePage: React.FC = () => {
  // Placeholder navigation functions (replace with React Router's useNavigate or Link components)
  const navigate = useNavigate(); // Example if using React Router
  const navigateTo = (path: string) => {
    console.log(`Navigating to ${path}`); // Placeholder action
     navigate(path); // Use this if using React Router's useNavigate
    // Or using simple browser navigation (less ideal for SPAs)
    // window.location.href = path;
  };

  // Array of imported images for easier mapping
  const staticImages = [
    { id: "pet1", src: petImage1, alt: "Cute pet available for adoption 1" },
    { id: "pet2", src: petImage2, alt: "Cute pet available for adoption 2" },
    { id: "pet3", src: petImage3, alt: "Cute pet available for adoption 3" },
    { id: "pet5", src: petImage4, alt: "Cute pet available for adoption 3" },
    { id: "pet4", src: petImage5, alt: "Cute pet available for adoption 3" },
    { id: "pet6", src: petImage6, alt: "Cute pet available for adoption 3" },
    // Add more objects if you imported more images
    // { id: 'pet4', src: petImage4, alt: 'Cute pet available for adoption 4' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 to-orange-50">
      {/* Changed gradient slightly */}
      {/* Header */}
      <ErrorBoundary>
        <Header />
        {/* other components */}
      </ErrorBoundary>

      {/* Main Content */}
      <main className="flex-grow container py-12 md:py-20 px-4 md:px-10">
        {/* Welcome Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-gray-900 mb-4">
            Find Your New Best Friend
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto">
            PawPal connects loving homes with pets in need. Start your journey
            to adoption today!
          </p>
        </section>

        {/* Static Image Gallery Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-gray-800">
            Meet Some Pawsome Pals!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {staticImages.map((image) => (
              <div
                key={image.id}
                className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
              >
                <AspectRatio ratio={4 / 3}>
                  {" "}
                  {/* Ensures consistent image shape */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="object-cover w-full h-full"
                    loading="lazy" // Add lazy loading for performance
                  />
                </AspectRatio>
                {/* Optional: Add a small caption area if desired
                 <div className="p-3 text-center text-sm text-muted-foreground">
                    Ready for adoption!
                 </div>
                 */}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigateTo("/browse-pets")}>
             Browse Pets
            </Button>
          </div>
        </section>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
