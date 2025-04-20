import React from "react";
import { NavLink } from "react-router-dom"; // Use NavLink for active styling

const Navbar: React.FC = () => {
  // Helper function for NavLink active styling
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      isActive
        ? "bg-primary/10 text-primary shadow-sm" // Active state style
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground" // Default state style
    }`;
  };

  return (
    <nav className="border-b bg-background shadow-sm">
      
      {/* Style the navbar bar */}
      <div className="container flex h-12 items-center justify-start space-x-4 px-4 md:px-6">
        
        {/* Container for padding and alignment */}
        <NavLink to="/dashboard" className={getNavLinkClass} end>
          
          {/* 'end' prevents matching nested routes */}
          Dashboard
        </NavLink>
        <NavLink to="/browse-pets" className={getNavLinkClass}>
          
        
          Browse Pets
        </NavLink>
        <NavLink to="/pets/new" className={getNavLinkClass}>
          
        
          Donate a Pet
        </NavLink>
        <NavLink to="/my-listings" className={getNavLinkClass}>
          
        
          My Listings
        </NavLink>
        <NavLink to="/my-requests" className={getNavLinkClass}>
          
        
          My Requests
        </NavLink>
        {/* Add more links as needed */}
      </div>
    </nav>
  );
};

export default Navbar;
