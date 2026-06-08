import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginSignup from './login/login-signup/LoginSignup';
import PaymentPortal from './portal/PaymentPortal';
import AdminDashboard from './portal/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NetworkBanner from './components/NetworkBanner';

function App() {
  return (
    <BrowserRouter>
      <NetworkBanner />
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/portal" element={
          <ProtectedRoute>
            <PaymentPortal />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
