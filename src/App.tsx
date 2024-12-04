import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminLogin } from './components/auth/AdminLogin';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AddEmployeePage } from './pages/AddEmployeePage';
import { storage } from './utils/storage';
import { usePasswordProtection } from './contexts/PasswordProtectionContext';
import { PasswordProtectionProvider } from './contexts/PasswordProtectionContext';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin token exists
    if (!storage.isAdmin()) {
      navigate('/login');
    }
  }, [navigate]);

  if (!storage.isAdmin()) {
    return null; // Return null instead of Navigate to prevent flash of login page
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!storage.isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function EmployeeProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isUnlocked } = usePasswordProtection();
  
  if (!storage.isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isUnlocked) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <PasswordProtectionProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={
            storage.isAdmin() ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />
          } />
          <Route
            path="/admin"
            element={
              <AuthWrapper>
                <DashboardLayout />
              </AuthWrapper>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route 
              path="employees" 
              element={
                <EmployeeProtectedRoute>
                  <EmployeesPage />
                </EmployeeProtectedRoute>
              } 
            />
            <Route 
              path="add-employee" 
              element={
                <EmployeeProtectedRoute>
                  <AddEmployeePage />
                </EmployeeProtectedRoute>
              } 
            />
          </Route>
          <Route path="/" element={
            storage.isAdmin() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </Router>
    </PasswordProtectionProvider>
  );
}

export default App;