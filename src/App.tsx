import { useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SuppliersPage } from './pages/SuppliersPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage, { DashboardContent } from './pages/DashboardPage';
import { BillingPage } from './pages/BillingPage';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/Landing';
import PricingPage from './pages/Pricing';
import { WinningProductsPage } from './pages/WinningProductsPage';
import { TrainingPage } from './pages/TrainingPage';
import { DatabasePage as InfluencersPage } from './pages/SearchPage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AffiliatePage } from './pages/AffiliatePage';
import SettingsPage from './pages/SettingsPage';
import { AdminFinancialsPage } from './pages/AdminFinancialPage';
import { QuickPay } from './pages/QuickPay';
import { AdminUsersPage } from './pages/AdminUsersPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage';
import AdminPastDuePage from './pages/AdminPastDuePage';
import { SupportPage } from './pages/SupportPage';
import { AdminSupportPage } from './pages/AdminSupportPage';
import { GuestTicketPage } from './pages/GuestTicketPage';
import { SupportWidget } from './components/support/SupportWidget';

const queryClient = new QueryClient();

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SupportWidget />
          <Routes>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/pay/:plan" element={<QuickPay />} />
            <Route path="/support/ticket/:ticketId" element={<GuestTicketPage />} />

            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>}>
              <Route index element={<DashboardContent />} />
              <Route path="products" element={<WinningProductsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="training" element={<TrainingPage />} />
              <Route path="support" element={<SupportPage />} />

              {/* --- NEW ROUTE HERE --- */}
              <Route path="training/:courseId" element={<CoursePlayerPage />} />

              <Route path="influencers" element={<InfluencersPage />} />
              <Route path="influencers/:id" element={<CreatorProfilePage />} />
              <Route path="affiliate" element={<AffiliatePage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="admin/financials" element={<AdminFinancialsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/users/:userId" element={<AdminUserDetailsPage />} />
              <Route path="admin/financials/past-due" element={<AdminPastDuePage />} />
              <Route path="admin/support" element={<AdminSupportPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;