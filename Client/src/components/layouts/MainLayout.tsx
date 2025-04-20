// src/components/layout/MainLayout.tsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Navbar from "./Navbar"; // Import the Navbar component


interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Check if the user is logged in to decide if Navbar should be shown


  return (
    <div className="flex flex-col min-h-screen ">
      <Header />

      <Navbar />
      <main className="flex-grow bg-slate-50">
        {" "}
        {/* Added a light background to main content */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
