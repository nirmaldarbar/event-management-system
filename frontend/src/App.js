import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './app/store';
import { getMe } from './features/auth/authSlice';
import { ToastContainer } from 'react-toastify';
import socketService from './utils/socket';
import { ThemeProvider, useTheme } from '@/components/theme-provider';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Routes/PrivateRoute';
import { ComingSoon, NotFound } from '@/components/common/ComingSoon';
import InteractiveBackground from '@/components/common/InteractiveBackground';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import Notification from './pages/Notifications';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ThemedToasts = () => {
  const { theme } = useTheme();
  return <ToastContainer position="top-right" autoClose={3000} theme={theme} />;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check for token and get user data
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  useEffect(() => {
    // Connect to socket if user is logged in
    if (user) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return (
    <Router>
      <ScrollToTop />
      <InteractiveBackground />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/forgot-password" element={<ComingSoon title="Password reset is coming soon" />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/notifications" element={<Notification />} />
            {['about', 'contact', 'privacy', 'terms', 'cookies'].map((p) => (
              <Route key={p} path={`/${p}`} element={<ComingSoon title="This page is coming soon" />} />
            ))}

            {/* Protected Routes */}
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
            <Route
              path="/create-event"
              element={
                <PrivateRoute allowedRoles={['organizer', 'admin']}>
                  <CreateEventPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/organizer/dashboard"
              element={
                <PrivateRoute allowedRoles={['organizer']}>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ThemedToasts />
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
