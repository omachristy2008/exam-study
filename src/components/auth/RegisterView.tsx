import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useApp } from '../../context/AppContext';
import { ExamType } from '../../types';

export const RegisterView: React.FC = () => {
  const { register, navigate, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [educationType, setEducationType] = useState<ExamType>('both');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const success = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        education_type: educationType,
      });

      if (success) {
        showToast('Account created successfully! Let’s setup your academic profile.', 'success');
        navigate('/onboarding');
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F5] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <BrandLogo size="lg" showTagline />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#A1A1AA]">
          Join thousands of students mastering WAEC and University examinations.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Chioma Adeleke"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="e.g. name@student.edu.ng or personal email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            {/* Primary Track Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                What are you preparing for?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'university', label: 'University', desc: 'Degree Courses' },
                  { id: 'waec', label: 'WAEC', desc: 'SSCE Subjects' },
                  { id: 'both', label: 'Both', desc: 'All Curriculum' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEducationType(opt.id as ExamType)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      educationType === opt.id
                        ? 'bg-[#1A1A1E] border-[#FF6A00] text-white shadow-sm'
                        : 'bg-[#1A1A1E] border-[#27272C] text-[#A1A1AA] hover:text-white hover:border-[#71717A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{opt.label}</span>
                      {educationType === opt.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6A00]" />
                      )}
                    </div>
                    <div className="text-[10px] text-[#71717A]">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#71717A] mt-1">
                You can change or expand your academic curriculum at any time in settings.
              </p>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00] transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#A1A1AA] border-t border-[#27272C]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-bold text-[#FF6A00] hover:underline cursor-pointer ml-1"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
