import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import Layout from '@/src/components/Layout';
import Login from '@/src/pages/Login';
import MechanicDashboard from '@/src/pages/mechanic/Dashboard';
import JobDetail from '@/src/pages/mechanic/JobDetail';
import ManagerDashboard from '@/src/pages/manager/Dashboard';
import FleetList from '@/src/pages/manager/FleetList';
import Reports from '@/src/pages/manager/Reports';
import AllJobs from '@/src/pages/manager/AllJobs';
import Alerts from '@/src/pages/manager/Alerts';
import Settings from '@/src/pages/manager/Settings';
import NewJob from '@/src/pages/manager/NewJob';
import Catalogue from '@/src/pages/manager/Catalogue';
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
  return <Navigate to="/manager" />;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="fleetdesk-theme">
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
              <Route path="fleet" element={<FleetList />} />
              <Route path="reports" element={<Reports />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="jobs" element={<AllJobs />} />
              <Route path="catalogue" element={<Catalogue />} />
              
              {/* Shared Routes */}
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="jobs/new" element={<NewJob />} />
              
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
