// App.tsx with React Router
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ToastContainer } from "react-toastify";
// Import other pages: LoginPage, SignupPage, BrowsePetsPage, PetDetailPage...
import "./App.css";
import MainLayout from "./components/layouts/MainLayout";
import ListPetPage from "./pages/ListPetPage";
import MyListingsPage from "./pages/MyListingPage";
import PetDetailPage from "./pages/PetDetailPage";
import BrowsePetsPage from "./pages/BrowsePetsPage";
import MyRequestsPage from "./pages/MyRequestPage";
// import { Edit } from "lucide-react";
import EditPetPage from "./pages/EditPetPage";
function App() {
  return (
    <Router>
      {/* ToastContainer renders the notifications */}
      <ToastContainer
        position="top-right" // Or "bottom-right", "top-center", etc.
        autoClose={5000} // Auto close after 5 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // Or "dark", "colored"
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard" // Define the path for the dashboard
          element={
            <ProtectedRoute>
              {/* Ensure user is logged in */}
              <MainLayout>
                {/* Include Header/Footer */}
                <DashboardPage /> {/* Render the dashboard */}
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pets/new" // Define the path for the dashboard
          element={
            <ProtectedRoute>
              {/* Ensure user is logged in */}
              <MainLayout>
                {/* Include Header/Footer */}
                <ListPetPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings" // Define the path for the dashboard
          element={
            <ProtectedRoute>
              {/* Ensure user is logged in */}
              <MainLayout>
                {/* Include Header/Footer */}
                <MyListingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pets/manage/:petId" // Public route for viewing details
          element={
            <MainLayout>
              {" "}
              {/* Still use layout for header/footer */}
              <PetDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/browse-pets" // Public browse route
          element={
            <MainLayout>
              {" "}
              {/* Use layout for consistent header/footer/navbar */}
              <BrowsePetsPage />
            </MainLayout>
          }
        />
        <Route
          path="/my-requests" // <-- Add route for My Requests
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyRequestsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pets/edit/:petId" // <-- Add route for My Requests
          element={
            <ProtectedRoute>
                <EditPetPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
