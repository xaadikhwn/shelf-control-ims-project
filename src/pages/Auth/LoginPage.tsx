import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* Left Panel - Branding & Animation (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-indigo-600 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/50 blur-[120px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/40 blur-[100px]"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <span className="font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">BizManage</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6"
          >
            Manage your business with clarity.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-indigo-100 text-lg leading-relaxed"
          >
            Everything you need to track inventory, payroll, and customers in one beautiful platform.
          </motion.p>
        </div>
        
        <div className="relative z-10 flex gap-4 text-indigo-200 text-sm">
          <span>© 2026 BizManage Inc.</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Enter your details to access your account.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
              
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-white bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-50 font-semibold overflow-hidden"
            >
              <span className="relative z-10">{loading ? 'Signing in...' : 'Sign in to account'}</span>
              {!loading && <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-10">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-gray-900 dark:text-white hover:underline decoration-indigo-500 decoration-2 underline-offset-4">
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
