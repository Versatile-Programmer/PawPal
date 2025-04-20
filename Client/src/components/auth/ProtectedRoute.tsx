import React from "react";
import { useRecoilValue } from "recoil";
import { Navigate, useLocation } from "react-router-dom";
import { authTokenState } from "../../store/authAtom"; // Adjust path

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Read the token value (string or null) from the Recoil atom
  const token = useRecoilValue(authTokenState);
 
  const location = useLocation();

  console.log("ProtectedRoute Check - Token State:", token ? "Exists" : "Null");

  if (!token) {
    // No token in Recoil state, assume not authenticated for routing
    console.log("ProtectedRoute - No token, redirecting to login.");
    // Redirect to login, passing the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token exists in Recoil state, allow access to the child route
  return <>{children}</>;
};

export default ProtectedRoute;
