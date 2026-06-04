import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginPageProps {
  setCurrentPage: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage }) => {
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      setCurrentPage('home');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome! 🎉');
      setCurrentPage('home');
    } catch (err: any) {
      toast.error(err.message || 'Google login failed');
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    try {
      await resetPassword(resetEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgot(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-chocolate-900 via-chocolate-800 to-dubai-dark flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-gold-500 to-gold-400 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <LogIn size={36} className="text-chocolate-900" />
          </div>
          <h1 className="font-display text-2xl font-bold text-chocolate-900">Welcome Back</h1>
          <p className="text-chocolate-700 mt-1">Sign in to MRM Shopping 🛍</p>
        </div>

        <div className="p-8">
          {!showForgot ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-chocolate-700 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
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
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-12 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-chocolate-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                >
                  Forgot Password?
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold text-lg hover:from-gold-400 hover:to-gold-300 transition shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-gold-200"></div>
                <span className="text-sm text-chocolate-400">or</span>
                <div className="flex-1 h-px bg-gold-200"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white border-2 border-gold-200 rounded-xl font-semibold text-chocolate-700 hover:bg-gold-50 hover:border-gold-300 transition flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              <p className="text-center text-sm text-chocolate-500 mt-6">
                Don't have an account?{' '}
                <button onClick={() => setCurrentPage('register')} className="text-gold-600 font-semibold hover:underline">
                  Register here
                </button>
              </p>
            </>
          ) : (
            <div className="animate-fadeIn">
              <h3 className="font-display text-xl font-bold text-chocolate-900 mb-2">Reset Password</h3>
              <p className="text-sm text-chocolate-500 mb-4">Enter your email to receive a password reset link</p>
              <input
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 outline-none text-chocolate-800 mb-4"
              />
              <button
                onClick={handleResetPassword}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold hover:from-gold-400 hover:to-gold-300 transition shadow-lg mb-3"
              >
                Send Reset Link
              </button>
              <button
                onClick={() => setShowForgot(false)}
                className="w-full py-2 text-chocolate-500 hover:text-chocolate-700 text-sm"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
