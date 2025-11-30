// src/App.tsx

import { useEffect, Suspense } from 'react'; // Import useEffect
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { SuppliersPage } from './pages/SuppliersPage';
// Components
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
// Create a client
const queryClient = new QueryClient();

function App() {
  const { i18n } = useTranslation();

  // This effect sets the document direction based on the current language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/pay/:plan" element={<QuickPay />} />
            {/* Protected Routes with Nested Layout */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>}>
              <Route index element={<DashboardContent />} />
              <Route path="products" element={<WinningProductsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="training" element={<TrainingPage />} />
              <Route path="influencers" element={<InfluencersPage />} />
              <Route path="influencers/:id" element={<CreatorProfilePage />} />
              <Route path="affiliate" element={<AffiliatePage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="admin/financials" element={<AdminFinancialsPage />} />

              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Add a default route */}
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;