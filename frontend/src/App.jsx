import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AllEvents from './pages/AllEvents';
import About from './pages/About';
import DashboardRouter from './components/common/DashboardRouter';
import AttendeeDashboard from './pages/dashboard/AttendeeDashboard';
import OrganizerDashboard from './pages/dashboard/OrganizerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import Lounge from './pages/Lounge';

/**
 * Protected Route Guard to prevent unauthorized entry
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden w-full relative">
          <Navbar />
          <main className="flex-grow flex flex-col justify-center">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/events" element={<AllEvents />} />
              <Route path="/about" element={<About />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/attendee"
                element={
                  <ProtectedRoute>
                    <AttendeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/organizer"
                element={
                  <ProtectedRoute>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lounge"
                element={
                  <ProtectedRoute>
                    <Lounge />
                  </ProtectedRoute>
                }
              />

              {/* Redirect Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {/* Footer: only on public pages */}
          <FooterConditional />
        </div>
      </Router>
    </AuthProvider>
  );
}

const FooterConditional = () => {
  const { pathname } = useLocation();
  const hideOn = ['/dashboard', '/lounge'];
  const shouldHide = hideOn.some(path => pathname.startsWith(path));
  if (shouldHide) return null;
  return <Footer />;
};

export default App;
