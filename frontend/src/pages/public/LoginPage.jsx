import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { School, Mail, Lock, Sparkles, ArrowLeft } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const autofillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Schola<span className="text-indigo-600">Verse</span>
          </h2>
        </div>
        <p className="text-center text-sm text-slate-500">Sign in to your academic portal account</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-soft rounded-3xl border border-slate-200/80 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@scholaverse.edu"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
              Sign In to Account
            </Button>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Quick Demo Autofill Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => autofillDemo('admin@scholaverse.edu', 'Admin@123')}
                className="p-2 text-center rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-semibold transition"
              >
                <div className="text-base">👑</div>
                <div>Admin</div>
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('sarah.jenkins@scholaverse.edu', 'Teacher@123')}
                className="p-2 text-center rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-semibold transition"
              >
                <div className="text-base">👩‍🏫</div>
                <div>Teacher</div>
              </button>
              <button
                type="button"
                onClick={() =>
                  autofillDemo('michael.vance@parent.scholaverse.edu', 'Guardian@123')
                }
                className="p-2 text-center rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold transition"
              >
                <div className="text-base">👨‍👩‍👦</div>
                <div>Guardian</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
