import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';
import {
  Mail,
  Lock,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  BookOpen,
  Users,
  CheckCircle,
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoleBadge, setActiveRoleBadge] = useState(null);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'TEACHER') navigate('/teacher/dashboard');
      else if (user.role === 'GUARDIAN') navigate('/guardian/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemo = (demoEmail, demoPassword, roleKey) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setActiveRoleBadge(roleKey);
    toast.info(`Filled credentials for ${roleKey}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Subtle Ambient Background Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" /> Back to Overview
        </Link>

        {/* Central Logo */}
        <div className="flex flex-col items-center justify-center mb-2">
          <Logo size="lg" showText={true} textVariant="dark" subtitle="Academy OS" />
          <p className="text-center text-xs text-slate-500 mt-2 font-medium">
            Sign in to access your designated institutional portal
          </p>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft rounded-3xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setActiveRoleBadge(null);
                  }}
                  placeholder="name@scholaverse.edu"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setActiveRoleBadge(null);
                  }}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-bold shadow-md shadow-indigo-600/20"
              isLoading={isLoading}
            >
              Sign In to Account
            </Button>
          </form>

          {/* Quick Demo Autofill Pod (No tacky emojis - clean Lucide icons) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              1-Click Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => autofillDemo('admin@scholaverse.edu', 'Admin@123', 'Admin')}
                className={`p-2.5 text-center rounded-2xl border transition text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                  activeRoleBadge === 'Admin'
                    ? 'bg-purple-100/90 border-purple-400 text-purple-950 ring-2 ring-purple-400/30'
                    : 'bg-purple-50/70 hover:bg-purple-100 border-purple-200/80 text-purple-900'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-purple-200/70 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  autofillDemo('sarah.jenkins@scholaverse.edu', 'Teacher@123', 'Faculty')
                }
                className={`p-2.5 text-center rounded-2xl border transition text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                  activeRoleBadge === 'Faculty'
                    ? 'bg-indigo-100/90 border-indigo-400 text-indigo-950 ring-2 ring-indigo-400/30'
                    : 'bg-indigo-50/70 hover:bg-indigo-100 border-indigo-200/80 text-indigo-900'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-indigo-200/70 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  autofillDemo(
                    'michael.vance@parent.scholaverse.edu',
                    'Guardian@123',
                    'Guardian'
                  )
                }
                className={`p-2.5 text-center rounded-2xl border transition text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                  activeRoleBadge === 'Guardian'
                    ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/30'
                    : 'bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200/80 text-emerald-900'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-200/70 text-emerald-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span>Guardian</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>JWT HMAC-SHA256 • Server-Side RBAC Guard Active</span>
        </div>
      </div>
    </div>
  );
};
