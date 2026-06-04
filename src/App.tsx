import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import TrackingPage from './pages/TrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-chocolate-900 via-chocolate-800 to-dubai-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="font-display text-2xl font-bold text-gold-400 mb-2">MRM Shopping 🛍</h2>
          <p className="text-chocolate-300">Loading premium experience...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'products': return <ProductsPage />;
      case 'cart': return <CartPage setCurrentPage={setCurrentPage} />;
      case 'contact': return <ContactPage />;
      case 'tracking': return <TrackingPage />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'register': return <RegisterPage setCurrentPage={setCurrentPage} />;
      case 'account': return <AccountPage setCurrentPage={setCurrentPage} defaultTab="profile" />;
      case 'orders': return <AccountPage setCurrentPage={setCurrentPage} defaultTab="orders" />;
      case 'admin-login': return <AdminLoginPage setCurrentPage={setCurrentPage} />;
      case 'admin': return <AdminPage setCurrentPage={setCurrentPage} />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  const hideNavFooter = ['login', 'register', 'admin-login', 'admin'].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavFooter && <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      <main className="flex-1">
        {renderPage()}
      </main>
      {!hideNavFooter && <Footer setCurrentPage={setCurrentPage} />}
      <Toaster position="top-right" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
