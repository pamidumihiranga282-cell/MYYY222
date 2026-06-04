import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import TrackingPage from './pages/TrackingPage';
import ContactPage from './pages/ContactPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.email !== 'mrmshopping2025@gmail.com') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode; withFooter?: boolean }> = ({ children, withFooter = true }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    {withFooter && <Footer />}
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
      <Route path="/products" element={<AppLayout><ProductsPage /></AppLayout>} />
      <Route path="/products/:id" element={<AppLayout><ProductDetailPage /></AppLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cart" element={<AppLayout><ProtectedRoute><CartPage /></ProtectedRoute></AppLayout>} />
      <Route path="/tracking" element={<AppLayout><TrackingPage /></AppLayout>} />
      <Route path="/contact" element={<AppLayout><ContactPage /></AppLayout>} />
      <Route path="/account" element={<AppLayout><ProtectedRoute><AccountPage /></ProtectedRoute></AppLayout>} />
      <Route path="/account/orders" element={<AppLayout><ProtectedRoute><AccountPage /></ProtectedRoute></AppLayout>} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a0800',
                color: '#fef3c7',
                border: '1px solid rgba(180, 83, 9, 0.3)',
              },
              success: { iconTheme: { primary: '#f59e0b', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
