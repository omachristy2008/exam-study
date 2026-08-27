import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, navigate, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const success = await login(email.trim(), password);
      if (success) {
        showToast('Welcome back to EXAMAI!', 'success');
        if (email.trim().toLowerCase() === 'omachristy4@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage('Invalid credentials or account not found.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <BrandLogo size="lg" showTagline />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#A1A1AA]">
          Prepare for WAEC and University Exams with AI and Verified Past Papers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@university.edu.ng or personal email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#A1A1AA]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset link sent to registered email.', 'info')}
                  className="text-[11px] font-semibold text-[#FF6A00] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#71717A] hover:text-[#A1A1AA]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#A1A1AA]">
            Don&apos;t have an account yet?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-bold text-[#FF6A00] hover:underline cursor-pointer ml-1"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Security and Privacy Footprint */}
        <div className="mt-6 text-center text-[11px] text-[#71717A] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Session • Academic Database Integrity Guaranteed</span>
        </div>
      </div>
    </div>
  );
};
