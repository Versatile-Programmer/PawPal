// src/components/layout/Footer.tsx
import React from "react";
import { PawPrint } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-slate-100">
      {/* Removed mt-16, Layout will handle spacing */}
      <div className="container py-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left px-4 md:px-8">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <PawPrint className="h-5 w-5 text-primary" />
          <span className="font-semibold">PawPal</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} PawPal. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          {/* Optional placeholder links */}
          {/* <a href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</a>
           <a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
