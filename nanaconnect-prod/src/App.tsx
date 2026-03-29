import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";

// User pages
import UserLayout from "./components/layout/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import BrowsePujas from "./pages/user/BrowsePujas";
import BrowsePandits from "./pages/user/BrowsePandits";
import BookingFlow from "./pages/user/BookingFlow";
import BookingHistory from "./pages/user/BookingHistory";
import UserProfile from "./pages/user/UserProfile";

// Pandit pages
import PanditLayout from "./components/layout/PanditLayout";
import PanditDashboard from "./pages/pandit/PanditDashboard";
import PanditProfilePage from "./pages/pandit/PanditProfile";
import PanditAvailability from "./pages/pandit/PanditAvailability";
import PanditBookings from "./pages/pandit/PanditBookings";
import PanditEarnings from "./pages/pandit/PanditEarnings";

// Admin pages
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManagePandits from "./pages/admin/ManagePandits";
import ManagePujas from "./pages/admin/ManagePujas";
import ManageBookings from "./pages/admin/ManageBookings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* User routes */}
            <Route path="/user" element={<UserLayout><UserDashboard /></UserLayout>} />
            <Route path="/user/pujas" element={<UserLayout><BrowsePujas /></UserLayout>} />
            <Route path="/user/pandits" element={<UserLayout><BrowsePandits /></UserLayout>} />
            <Route path="/user/book" element={<UserLayout><BookingFlow /></UserLayout>} />
            <Route path="/user/bookings" element={<UserLayout><BookingHistory /></UserLayout>} />
            <Route path="/user/profile" element={<UserLayout><UserProfile /></UserLayout>} />

            {/* Pandit routes */}
            <Route path="/pandit" element={<PanditLayout><PanditDashboard /></PanditLayout>} />
            <Route path="/pandit/profile" element={<PanditLayout><PanditProfilePage /></PanditLayout>} />
            <Route path="/pandit/availability" element={<PanditLayout><PanditAvailability /></PanditLayout>} />
            <Route path="/pandit/bookings" element={<PanditLayout><PanditBookings /></PanditLayout>} />
            <Route path="/pandit/earnings" element={<PanditLayout><PanditEarnings /></PanditLayout>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><ManageUsers /></AdminLayout>} />
            <Route path="/admin/pandits" element={<AdminLayout><ManagePandits /></AdminLayout>} />
            <Route path="/admin/pujas" element={<AdminLayout><ManagePujas /></AdminLayout>} />
            <Route path="/admin/bookings" element={<AdminLayout><ManageBookings /></AdminLayout>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
