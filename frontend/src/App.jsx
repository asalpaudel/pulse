import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import Toaster from "./components/ui/Toaster";
import DashboardLayout from "./components/layout/DashboardLayout";
import {
  ProtectedRoute,
  RoleRoute,
  PublicOnlyRoute,
} from "./components/RouteGuards";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import SuperAdminSecurity from "./pages/superadmin/SuperAdminSecurity";

// Donor
import DonorOverview from "./pages/donor/DonorOverview";
import DonorAlerts from "./pages/donor/DonorAlerts";
import DonorRequests from "./pages/donor/DonorRequests";
import DonorEvents from "./pages/donor/DonorEvents";
import DonorHistory from "./pages/donor/DonorHistory";
import DonorProfile from "./pages/donor/DonorProfile";

// Hospital
import HospitalOverview from "./pages/hospital/HospitalOverview";
import HospitalRequests from "./pages/hospital/HospitalRequests";
import HospitalDonorSearch from "./pages/hospital/HospitalDonorSearch";
import HospitalBloodBankSearch from "./pages/hospital/HospitalBloodBankSearch";
import HospitalProfile from "./pages/hospital/HospitalProfile";

// Blood bank
import BloodBankOverview from "./pages/bloodbank/BloodBankOverview";
import BloodBankStock from "./pages/bloodbank/BloodBankStock";
import BloodBankRequests from "./pages/bloodbank/BloodBankRequests";
import BloodBankEvents from "./pages/bloodbank/BloodBankEvents";
import BloodBankProfile from "./pages/bloodbank/BloodBankProfile";

// Admin
import AdminOverview from "./pages/admin/AdminOverview";
import AdminVerify from "./pages/admin/AdminVerify";
import AdminUsers from "./pages/admin/AdminUsers";

// Wraps a role's dashboard routes with auth + role guards + the shared layout.
function RoleDashboard({ role }) {
  return (
    <ProtectedRoute>
      <RoleRoute role={role}>
        <NotificationsProvider>
          <DashboardLayout />
        </NotificationsProvider>
      </RoleRoute>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

            {/* Donor */}
            <Route path="/donor" element={<RoleDashboard role="DONOR" />}>
              <Route index element={<DonorOverview />} />
              <Route path="alerts" element={<DonorAlerts />} />
              <Route path="requests" element={<DonorRequests />} />
              <Route path="events" element={<DonorEvents />} />
              <Route path="history" element={<DonorHistory />} />
              <Route path="profile" element={<DonorProfile />} />
            </Route>

            {/* Hospital */}
            <Route path="/hospital" element={<RoleDashboard role="HOSPITAL" />}>
              <Route index element={<HospitalOverview />} />
              <Route path="requests" element={<HospitalRequests />} />
              <Route path="donors" element={<HospitalDonorSearch />} />
              <Route path="bloodbanks" element={<HospitalBloodBankSearch />} />
              <Route path="profile" element={<HospitalProfile />} />
            </Route>

            {/* Blood Bank */}
            <Route
              path="/bloodbank"
              element={<RoleDashboard role="BLOOD_BANK" />}
            >
              <Route index element={<BloodBankOverview />} />
              <Route path="stock" element={<BloodBankStock />} />
              <Route path="requests" element={<BloodBankRequests />} />
              <Route path="events" element={<BloodBankEvents />} />
              <Route path="profile" element={<BloodBankProfile />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<RoleDashboard role="ADMIN" />}>
              <Route index element={<AdminOverview />} />
              <Route path="verify" element={<AdminVerify />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            <Route path="/superadmin" element={<RoleDashboard role="SUPER_ADMIN" />}>
              <Route index element={<SuperAdminSecurity />} />
              <Route path="security" element={<SuperAdminSecurity />} />
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ToastProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}
