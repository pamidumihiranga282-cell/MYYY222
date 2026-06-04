import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminLoginPageProps {
  setCurrentPage: (page: string) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Admin access granted! 🔐');
      setCurrentPage('admin');
    } catch (err: any) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-chocolate-900 via-dubai-dark to-chocolate-900 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-chocolate-900 to-chocolate-800 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-gold-500/30">
            <Shield size={36} className="text-gold-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-chocolate-300 mt-1">MRM Shopping Management 🔐</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-chocolate-700 mb-1 block">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-chocolate-700 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-chocolate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold text-lg hover:from-gold-400 hover:to-gold-300 transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : '🔐 Login as Admin'}
            </button>
          </form>

          <p className="text-center text-sm text-chocolate-400 mt-6">
            This area is restricted to authorized administrators only.
          </p>
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full mt-4 py-2 text-chocolate-500 hover:text-chocolate-700 text-sm transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
