import React, { useState, useContext } from 'react';
import ScrollToTop from './components/ScrollToTop';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { AuthContext } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AppPage from './pages/AppPage';
import Profile from './pages/Profile';
import IntegrationSettings from './pages/IntegrationSettings';

// Simple protected route wrapper
const ProtectedRoute = ({ children, openAuthModal }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }
  
  if (!user) {
    // Open modal and navigate to home if not logged in
    setTimeout(openAuthModal, 0);
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <Router>
      <ScrollToTop />
      <div className="w-screen min-h-screen overflow-x-hidden selection:bg-primary/30 text-white bg-background m-0 p-0 relative">
        <Navbar onLoginClick={openAuthModal} />
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
        
        <Routes>
          <Route path="/" element={<HomePage openAuthModal={openAuthModal} />} />
          <Route 
            path="/app" 
            element={
              <ProtectedRoute openAuthModal={openAuthModal}>
                <AppPage />
              </ProtectedRoute>
            } 
            />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute openAuthModal={openAuthModal}>
                <Profile />
              </ProtectedRoute>
            } 
            />
          <Route 
            path="/integrations" 
            element={
              <ProtectedRoute openAuthModal={openAuthModal}>
                <IntegrationSettings />
              </ProtectedRoute>
            } 
            />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
