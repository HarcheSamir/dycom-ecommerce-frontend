import { useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SuppliersPage } from './pages/SuppliersPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AgentPage from './pages/AgentPage';
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
import SetPasswordPage from './pages/SetPasswordPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage';
import AdminPastDuePage from './pages/AdminPastDuePage';
import { SupportPage } from './pages/SupportPage';
import { AdminSupportPage } from './pages/AdminSupportPage';
import { GuestTicketPage } from './pages/GuestTicketPage';
import { SupportWidget } from './components/support/SupportWidget';
import { AcademyAgentWidget } from './components/Agent/AcademyAgentWidget';

import { UpdatesPage } from './pages/UpdatesPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AdminResourcesPage } from './pages/AdminResourcesPage';
import { OrderShopPage } from './pages/OrderShopPage';
import { AdminShopOrdersPage } from './pages/AdminShopOrdersPage';
import { MyShopOrdersPage } from './pages/MyShopOrdersPage';
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
          {/* <AcademyAgentWidget /> - Hidden per user request */}

          <Routes>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/pay/:plan" element={<QuickPay />} />
            <Route path="/support/ticket/:ticketId" element={<GuestTicketPage />} />

            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>}>
              <Route index element={<DashboardContent />} />
              <Route path="products" element={<WinningProductsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="training" element={<TrainingPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="updates" element={<UpdatesPage />} />
              <Route path="training/:courseId" element={<CoursePlayerPage />} />
              <Route path="agent-ia" element={<AgentPage />} />
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
              <Route path="admin/resources" element={<AdminResourcesPage />} />
              <Route path="admin/shop-orders" element={<AdminShopOrdersPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="order-shop" element={<OrderShopPage />} />
              <Route path="my-orders" element={<MyShopOrdersPage />} />
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