import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import MainApp from './pages/MainApp';
import AccountSettings from './pages/AccountSettings';
import './App.css';

// Temporary Dashboard for testing authentication
const DummyDashboard = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      <button onClick={signOut} style={{ background: '#ef4444', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Log Out
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to dashboard (ProtectedRoute will handle redirecting to login if needed) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
