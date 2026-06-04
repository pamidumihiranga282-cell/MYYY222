import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, LogOut, Settings, Package, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Navbar: React.FC = () => {
  const { currentUser, userData, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (snap.exists() && snap.data().announcementEnabled) {
          setAnnouncement(snap.data().announcement || '');
        }
      } catch {}
    };
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/tracking', label: 'Track Order' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {announcement && (
        <div className="bg-amber-600 text-white text-center py-2 text-sm font-medium px-4">
          🎉 {announcement}
        </div>
      )}
      {/* Top bar */}
      <div className="bg-[#1a0a00] text-amber-200 text-xs py-1.5 px-4 hidden md:flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Phone size={11} /> 0707070872</span>
          <span className="flex items-center gap-1"><MapPin size={11} /> Anuradhapura, Sri Lanka</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Free delivery on orders over Rs. 2000</span>
          {isAdmin && (
            <Link to="/admin" className="text-amber-400 hover:text-white transition-colors">Admin Panel</Link>
          )}
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#1a0800]/95 shadow-xl backdrop-blur-md' : 'bg-[#1a0800]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500">
                <img src="/images/logo.png" alt="MRM Shopping" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xl font-bold text-amber-400 leading-none block">MRM Shopping</span>
                <span className="text-xs text-amber-200/60 leading-none">Dubai Chocolate & More</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-amber-400 ${location.pathname === link.to ? 'text-amber-400' : 'text-amber-100'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="text-amber-200 hover:text-amber-400 transition-colors">
                <Search size={20} />
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative text-amber-200 hover:text-amber-400 transition-colors">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 text-amber-200 hover:text-amber-400 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
                      {userData?.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={14} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl py-2 z-50 border border-amber-100">
                      <div className="px-4 py-2 border-b border-amber-50">
                        <p className="text-sm font-semibold text-gray-800 truncate">{userData?.displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                      </div>
                      <Link to="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors">
                        <User size={14} /> My Account
                      </Link>
                      <Link to="/account/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors">
                        <Package size={14} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors">
                          <Settings size={14} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                  Login
                </Link>
              )}

              {/* Mobile menu */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-amber-200 hover:text-amber-400">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="bg-[#1a0800] border-t border-amber-900/30 px-4 py-3">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for Dubai chocolates..."
                className="flex-1 bg-white/10 text-white placeholder-amber-200/40 border border-amber-700/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#1a0800] border-t border-amber-900/30 px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block text-sm font-medium py-2 border-b border-amber-900/20 transition-colors hover:text-amber-400 ${location.pathname === link.to ? 'text-amber-400' : 'text-amber-100'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-1 text-xs text-amber-300">
              <span className="flex items-center gap-1"><Phone size={11} /> 0707070872</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> Anuradhapura</span>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
