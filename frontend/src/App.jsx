import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public components
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SignIn from './features/auth/SignIn';
import SignUp from './features/auth/SignUp';
import PublicInvoice from './pages/PublicInvoice';

// Layout & Auth
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// SaaS Pages
import DashboardHome from './pages/DashboardHome';
import InvoicesList from './features/invoices/InvoicesList';
import InvoiceBuilder from './features/invoices/InvoiceBuilder';
import ClientsList from './features/clients/ClientsList';
import Settings from './pages/Settings';

// Layout Wrappers
const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-white">
    <Navbar />
    {children}
  </div>
);

const AuthLayout = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>
      {children}
    </DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ className: 'rounded-none border border-slate-200 shadow-sm text-sm font-medium tracking-tight' }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/signin" element={<PublicLayout><SignIn /></PublicLayout>} />
          <Route path="/signup" element={<PublicLayout><SignUp /></PublicLayout>} />
          <Route path="/auth/register" element={<PublicLayout><SignUp /></PublicLayout>} />
          <Route path="/invoice/:publicId" element={<PublicInvoice />} />

          {/* Authenticated SaaS Routes */}
          <Route path="/dashboard" element={<AuthLayout><DashboardHome /></AuthLayout>} />
          <Route path="/invoices" element={<AuthLayout><InvoicesList /></AuthLayout>} />
          <Route path="/invoices/new" element={<AuthLayout><InvoiceBuilder /></AuthLayout>} />
          <Route path="/invoices/edit/:id" element={<AuthLayout><InvoiceBuilder /></AuthLayout>} />
          <Route path="/clients" element={<AuthLayout><ClientsList /></AuthLayout>} />
          <Route path="/settings" element={<AuthLayout><Settings /></AuthLayout>} />
          <Route path="/help" element={<AuthLayout><div className="p-8"><h1 className="text-2xl font-bold mb-4">Help & Support</h1><p>Contact us at support@swiftinvoice.com</p></div></AuthLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
