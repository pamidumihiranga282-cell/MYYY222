import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, Menu, X, Home, Package, Phone, Truck, Shield, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'contact', label: 'Contact', icon: <Phone size={18} /> },
    { id: 'tracking', label: 'Tracking', icon: <Truck size={18} /> },
  ];

  const handleNav = (page: string) => {
    setCurrentPage(page);
    setMobileOpen(false);
    setProfileOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-chocolate-900 via-chocolate-800 to-chocolate-900 text-white shadow-2xl sticky top-0 z-50">
      {/* Special Banner */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-chocolate-900 text-center py-1.5 text-sm font-semibold tracking-wide">
        🍫 Premium Dubai Chocolates — Free delivery over 5kg! 🛍
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2 hover:opacity-90 transition">
            <img src="/images/logo.png" alt="MRM" className="w-10 h-10 rounded-full object-cover border-2 border-gold-400" />
            <div>
              <span className="font-display text-xl font-bold text-gold-300">MRM Shopping</span>
              <span className="text-lg ml-1">🛍</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gold-500 text-chocolate-900'
                    : 'text-chocolate-100 hover:bg-chocolate-700 hover:text-gold-300'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={() => handleNav('cart')}
              className="relative p-2 rounded-lg hover:bg-chocolate-700 transition"
            >
              <ShoppingCart size={22} className="text-gold-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse-gold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-chocolate-700 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-chocolate-900 font-bold text-sm">
                    {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:block text-sm text-chocolate-100">
                    {userProfile?.displayName || 'User'}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 bg-white text-chocolate-900 rounded-xl shadow-2xl w-56 py-2 border border-gold-200 z-50">
                    <div className="px-4 py-2 border-b border-gold-100">
                      <p className="font-semibold text-sm">{userProfile?.displayName}</p>
                      <p className="text-xs text-chocolate-500">{user.email}</p>
                    </div>
                    <button onClick={() => handleNav('account')} className="w-full text-left px-4 py-2.5 hover:bg-gold-50 text-sm flex items-center gap-2">
                      <User size={16} /> My Account
                    </button>
                    <button onClick={() => handleNav('orders')} className="w-full text-left px-4 py-2.5 hover:bg-gold-50 text-sm flex items-center gap-2">
                      <Package size={16} /> My Orders
                    </button>
                    {isAdmin && (
                      <button onClick={() => handleNav('admin')} className="w-full text-left px-4 py-2.5 hover:bg-gold-50 text-sm flex items-center gap-2 text-gold-600">
                        <Shield size={16} /> Admin Panel
                      </button>
                    )}
                    <hr className="my-1 border-gold-100" />
                    <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2">
                      <LogIn size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => handleNav('login')} className="flex items-center gap-1 px-3 py-2 text-sm text-chocolate-100 hover:text-gold-300 transition">
                  <LogIn size={16} /> Login
                </button>
                <button onClick={() => handleNav('register')} className="flex items-center gap-1 px-4 py-2 bg-gold-500 text-chocolate-900 rounded-lg text-sm font-semibold hover:bg-gold-400 transition">
                  <UserPlus size={16} /> Register
                </button>
              </div>
            )}

            {/* Mobile Menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-chocolate-700 transition">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-chocolate-800 border-t border-chocolate-700 pb-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
                currentPage === item.id ? 'bg-gold-500 text-chocolate-900' : 'text-chocolate-100 hover:bg-chocolate-700'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          {!user && (
            <>
              <button onClick={() => handleNav('login')} className="w-full flex items-center gap-3 px-6 py-3 text-sm text-chocolate-100 hover:bg-chocolate-700">
                <LogIn size={18} /> Login
              </button>
              <button onClick={() => handleNav('register')} className="w-full flex items-center gap-3 px-6 py-3 text-sm text-gold-300 hover:bg-chocolate-700">
                <UserPlus size={18} /> Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
