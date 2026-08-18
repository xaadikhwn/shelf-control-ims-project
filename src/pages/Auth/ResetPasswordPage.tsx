import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Reset link is missing its token');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password has been reset successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to reset password — the link may have expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 space-y-8 bg-navy-800 border border-navy-500/50 rounded-2xl shadow-2xl"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-accent-blue" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Set a new password
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Choose a new password for your account.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-navy-500/50 rounded-lg bg-navy-700/50 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200 text-sm"
              placeholder="New password (min. 6 characters)"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-navy-500/50 rounded-lg bg-navy-700/50 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-accent-blue hover:bg-accent-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-accent-blue transition-colors disabled:opacity-50 shadow-lg shadow-accent-blue/20"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-accent-blue-light hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
