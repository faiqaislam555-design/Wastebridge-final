import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
import RegistrationPage from './components/RegistrationPage'
import LoginPage from './components/LoginPage'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import GeneratorLayout from './dashboard/components/GeneratorLayout'
import DashboardHome from './dashboard/pages/DashboardHome'
import LogWaste from './dashboard/pages/LogWaste'
import BrowseCompanies from './dashboard/pages/BrowseCompanies'
import RequestPickup from './dashboard/pages/RequestPickup'
import PickupHistory from './dashboard/pages/PickupHistory'
import ComplianceReports from './dashboard/pages/ComplianceReports'
import GeneratorProfile from './dashboard/pages/GeneratorProfile'

// Shared imports
import SharedLayout from './components/Shared/SharedLayout'
import Notifications from './pages/Shared/Notifications'
import RatingsReviews from './pages/Shared/RatingsReviews'
import DocumentVault from './pages/Shared/DocumentVault'
import PricingInvoices from './pages/Shared/PricingInvoices'
import SupportHelp from './pages/Shared/SupportHelp'
import PortalSettings from './pages/Shared/PortalSettings'

// Disposal Company imports
import DisposalLayout from './components/Disposal/DisposalLayout'
import DisposalDashboard from './pages/Disposal/DisposalDashboard'
import ServiceListings from './pages/Disposal/ServiceListings'
import PickupRequests from './pages/Disposal/PickupRequests'
import ScheduleManager from './pages/Disposal/ScheduleManager'
import CertificateIssuer from './pages/Disposal/CertificateIssuer'
import CompanyProfile from './pages/Disposal/CompanyProfile'
import Earnings from './pages/Disposal/Earnings'

// Auth & Admin imports
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { AdminProvider } from './components/Admin/AdminContext'
import AdminLayout from './components/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
// Placeholders for A2, A3, A4 until implemented
import UserVerification from './pages/Admin/UserVerification'
import DisputeResolution from './pages/Admin/DisputeResolution'
import Analytics from './pages/Admin/Analytics'

const TitleUpdater = () => {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    let title = 'WasteBridge';
    
    if (path.includes('/generator/dashboard')) title = 'Dashboard — WasteBridge';
    else if (path.includes('/generator/log-waste')) title = 'Log Waste — WasteBridge';
    else if (path.includes('/generator/browse')) title = 'Find Partners — WasteBridge';
    else if (path.includes('/generator/request-pickup')) title = 'Request Pickup — WasteBridge';
    else if (path.includes('/generator/history')) title = 'Pickup History — WasteBridge';
    else if (path.includes('/generator/reports')) title = 'Compliance Reports — WasteBridge';
    else if (path.includes('/operator/dashboard')) title = 'Operator Dashboard — WasteBridge';
    else if (path.includes('/operator/requests')) title = 'Incoming Requests — WasteBridge';
    else if (path.includes('/operator/schedule')) title = 'My Schedule — WasteBridge';
    else if (path.includes('/operator/completed')) title = 'Completed Pickups — WasteBridge';
    else if (path.includes('/operator/certificates')) title = 'Issue Certificates — WasteBridge';
    else if (path.includes('/dashboard/notifications')) title = 'Notifications — WasteBridge';
    else if (path.includes('/dashboard/documents')) title = 'Document Vault — WasteBridge';
    else if (path.includes('/dashboard/reviews')) title = 'Ratings & Reviews — WasteBridge';
    else if (path.includes('/dashboard/invoices')) title = 'Billing — WasteBridge';
    else if (path.includes('/login')) title = 'Login — WasteBridge';
    else if (path.includes('/register')) title = 'Register — WasteBridge';
    
    document.title = title;
  }, [location]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <TitleUpdater />
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Generator Dashboard Routes */}
            <Route path="/generator" element={
              <ProtectedRoute allowedRoles={['generator']}>
                <GeneratorLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="log-waste" element={<LogWaste />} />
              <Route path="browse" element={<BrowseCompanies />} />
              <Route path="request-pickup" element={<RequestPickup />} />
              <Route path="history" element={<PickupHistory />} />
              <Route path="reports" element={<ComplianceReports />} />
              <Route path="profile" element={<GeneratorProfile />} />
              <Route index element={<DashboardHome />} />
            </Route>

            {/* Operator Dashboard Routes */}
            <Route path="/operator" element={
              <ProtectedRoute allowedRoles={['operator']}>
                <DisposalLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DisposalDashboard />} />
              <Route path="requests" element={<PickupRequests />} />
              <Route path="schedule" element={<ScheduleManager />} />
              <Route path="completed" element={<PickupHistory />} /> {/* Using PickupHistory as placeholder for completed */}
              <Route path="certificates" element={<CertificateIssuer />} />
              <Route path="profile" element={<CompanyProfile />} />
              <Route index element={<DisposalDashboard />} />
            </Route>

            {/* Shared Portal Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['generator', 'operator']}>
                <SharedLayout />
              </ProtectedRoute>
            }>
              <Route path="notifications" element={<Notifications />} />
              <Route path="reviews" element={<RatingsReviews />} />
              <Route path="documents" element={<DocumentVault />} />
              <Route path="invoices" element={<PricingInvoices />} />
              <Route path="settings" element={<PortalSettings />} />
              <Route index element={<Notifications />} />
            </Route>

          {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminProvider>
                <AdminLayout />
              </AdminProvider>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserVerification />} />
              <Route path="disputes" element={<DisputeResolution />} />
              <Route path="analytics" element={<Analytics />} />
              <Route index element={<AdminDashboard />} />
            </Route>

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
