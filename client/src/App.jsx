import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Landing
import LandingPage from "./pages/LandingPage";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
//Profile Page
import ProfilePage from "./pages/ProfilePage";
// Victim Pages
import VictimDashboard from "./pages/victim/VictimDashboard";
import CreateSOS from "./pages/victim/CreateSOS";
import TrackRescue from "./pages/victim/TrackRescue";
import NearbyReliefCamp from "./pages/victim/NearbyReliefCamp";
import EditSOS from "./pages/victim/EditSOS";

// Volunteer Pages
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import NearbyMap from "./pages/volunteer/NearbyMap";
import MyTasks from "./pages/volunteer/MyTasks";
import SOSDetailPage from "./pages/volunteer/SOSDetailPage";

// NGO Pages
import NGODashboard from "./pages/ngo/NGODashboard";
import InventoryPage from "./pages/ngo/InventoryPage";
import CampsPage from "./pages/ngo/CampsPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import IncidentsPage from "./pages/admin/IncidentsPage";
import BroadcastPage from "./pages/admin/BroadcastPage";
import ReportsPage from "./pages/admin/ReportsPage";
import DistributionMonitorPage from "./pages/admin/DistributionMonitorPage";

// Role-based protected route
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

// Redirect to role dashboard after login
const RoleRedirect = () => {
  const { user } = useAuth();
  const dashboards = {
    victim: "/victim",
    volunteer: "/volunteer",
    ngo: "/ngo",
    admin: "/admin",
  };
  return <Navigate to={dashboards[user?.role] || "/login"} />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Role redirect after login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />
        {/* own profile */}
        <Route path="/profile" element={<ProfilePage />} />
        {/* anyone's profile */}
        <Route path="/profile/:userId" element={<ProfilePage />} />{" "}
        {/* Victim routes */}
        <Route
          path="/victim"
          element={
            <ProtectedRoute roles={["victim"]}>
              <VictimDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/victim/sos"
          element={
            <ProtectedRoute roles={["victim"]}>
              <CreateSOS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/victim/track/:id"
          element={
            <ProtectedRoute roles={["victim"]}>
              <TrackRescue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/victim/sos/edit/:id"
          element={
            <ProtectedRoute roles={["victim"]}>
              <EditSOS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/victim/relief-camps"
          element={
            <ProtectedRoute roles={["victim"]}>
              <NearbyReliefCamp />
            </ProtectedRoute>
          }
        />
        {/* Volunteer routes */}
        <Route
          path="/volunteer"
          element={
            <ProtectedRoute roles={["volunteer"]}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/map"
          element={
            <ProtectedRoute roles={["volunteer", "admin"]}>
              <NearbyMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/tasks"
          element={
            <ProtectedRoute roles={["volunteer"]}>
              <MyTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/sos/:id"
          element={
            <ProtectedRoute roles={["volunteer"]}>
              <SOSDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rate-volunteer/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        {/* NGO routes */}
        <Route
          path="/ngo"
          element={
            <ProtectedRoute roles={["ngo"]}>
              <NGODashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/inventory"
          element={
            <ProtectedRoute roles={["ngo"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/camps"
          element={
            <ProtectedRoute roles={["ngo"]}>
              <CampsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute roles={["victim", "volunteer", "ngo", "admin"]}>
              <IncidentsPage />
            </ProtectedRoute>
          }
        />
        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/incidents"
          element={
            <ProtectedRoute roles={["admin"]}>
              <IncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/broadcast"
          element={
            <ProtectedRoute roles={["admin"]}>
              <BroadcastPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/distribution"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DistributionMonitorPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
