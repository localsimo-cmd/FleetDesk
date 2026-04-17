import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import MechanicDashboard from '@/pages/mechanic/Dashboard';
import JobDetail from '@/pages/mechanic/JobDetail';
import ManagerDashboard from '@/pages/manager/Dashboard';
import FleetList from '@/pages/manager/FleetList';
import Reports from '@/pages/manager/Reports';
import AllJobs from '@/pages/manager/AllJobs';
import Alerts from '@/pages/manager/Alerts';
import Settings from '@/pages/manager/Settings';
import NewJob from '@/pages/manager/NewJob';
import Catalogue from '@/pages/manager/Catalogue';
import VehicleDetail from '@/pages/manager/VehicleDetail';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from 'sonner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { profile } = useAuth();
  if (profile?.role === 'mechanic') {
    return <Navigate to="/mechanic" />;
  }
  return <Navigate to="/manager" />;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="fleetdesk-theme">
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<RootRedirect />} />
                
                <Route path="manager" element={<ManagerDashboard />} />
                <Route path="mechanic" element={<MechanicDashboard />} />
                <Route path="fleet" element={<FleetList />} />
                <Route path="fleet/:id" element={<VehicleDetail />} />
                <Route path="reports" element={<Reports />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="jobs" element={<AllJobs />} />
                <Route path="catalogue" element={<Catalogue />} />
                
                {/* Shared Routes */}
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="jobs/new" element={<NewJob />} />
                
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
