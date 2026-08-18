import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDevResetLink(null);
    try {
      const res = await authApi.forgotPassword(email);
      toast.success(res.message || 'If an account exists, a reset link has been sent.');

      // No email provider is configured in this environment — in development,
      // the backend returns the raw token directly so the flow can be tested
      // end-to-end. In production this field will not be present.
      if (res.devResetToken) {
        setDevResetLink(`/reset-password/${res.devResetToken}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-navy-800 border border-navy-500/50 rounded-2xl shadow-2xl"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-accent-blue" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Forgot password?
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Enter your email to receive a reset link.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-navy-500/50 rounded-lg bg-navy-700/50 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Email address"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-accent-blue hover:bg-accent-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-accent-blue transition-colors disabled:opacity-50 shadow-lg shadow-accent-blue/20"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        {devResetLink && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <p className="font-semibold mb-1">Development mode — no email provider configured</p>
            <Link to={devResetLink} className="underline break-all">
              {window.location.origin}{devResetLink}
            </Link>
          </div>
        )}

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
