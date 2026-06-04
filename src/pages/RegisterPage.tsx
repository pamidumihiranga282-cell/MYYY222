import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) return toast.error('Please fill all fields');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(email, password, name, phone);
      toast.success('Account created! Welcome to MRM Shopping 🎉');
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') toast.error('Email already registered. Please login.');
      else if (err.code === 'auth/weak-password') toast.error('Password too weak. Use at least 6 characters.');
      else toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Logged in with Google! 🎉');
      navigate('/');
    } catch (err: any) {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-[#0d0500] min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <img src="/images/logo.png" alt="MRM Shopping" className="w-12 h-12 rounded-full border-2 border-amber-500" />
            <span className="text-2xl font-bold text-amber-400">MRM Shopping</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-amber-200/50 mt-1">Join us for exclusive Dubai chocolate deals</p>
        </div>

        <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-8">
          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-colors mb-6 disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-amber-900/30" />
            <span className="text-amber-200/30 text-sm">or</span>
            <div className="flex-1 h-px bg-amber-900/30" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-amber-300 text-sm font-medium block mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="John Silva" required />
              </div>
            </div>
            <div>
              <label className="text-amber-300 text-sm font-medium block mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="text-amber-300 text-sm font-medium block mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="0707070872" required />
              </div>
            </div>
            <div>
              <label className="text-amber-300 text-sm font-medium block mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-amber-300 text-sm font-medium block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white placeholder-amber-200/20 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Repeat password" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-60">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={18} />}
              Create Account
            </button>
          </form>

          <p className="text-center text-amber-200/50 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
