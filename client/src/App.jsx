import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import DashboardPage from './pages/DashboardPage';
import ContractsPage from './pages/ContractsPage';
import UploadContractPage from './pages/UploadContractPage';
import ContractDetailPage from './pages/ContractDetailPage';
import PrecedentIntelligencePage from './pages/PrecedentIntelligencePage';
import MemoryCenterPage from './pages/MemoryCenterPage';
import NegotiationAssistantPage from './pages/NegotiationAssistantPage';
import ApprovalsPage from './pages/ApprovalsPage';
import ObligationsPage from './pages/ObligationsPage';
import RenewalsPage from './pages/RenewalsPage';
import PolicyCenterPage from './pages/PolicyCenterPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogPage from './pages/AuditLogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const ProtectedLayout = () => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-medium">Initializing LexiMem Session...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/:id" element={<ContractDetailPage />} />
            <Route path="/upload" element={<UploadContractPage />} />
            <Route path="/precedents" element={<PrecedentIntelligencePage />} />
            <Route path="/memory" element={<MemoryCenterPage />} />
            <Route path="/negotiation" element={<NegotiationAssistantPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/obligations" element={<ObligationsPage />} />
            <Route path="/renewals" element={<RenewalsPage />} />
            <Route path="/policies" element={<PolicyCenterPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
