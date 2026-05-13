import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid credentials or account blocked');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const demoEmails = {
      buyer: 'arun@example.com',
      seller: 'rajesh@example.com',
      admin: 'admin@indianrealestate.com'
    };
    setLoading(true);
    const success = await login(demoEmails[role], 'demo');
    if (success) {
      toast.success(`Logged in as ${role}`);
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-1 text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Demo Logins</span></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={() => handleDemoLogin('buyer')} className="rounded-lg border border-blue-200 bg-blue-50 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">Buyer</button>
              <button onClick={() => handleDemoLogin('seller')} className="rounded-lg border border-green-200 bg-green-50 py-2 text-sm font-medium text-green-600 hover:bg-green-100">Seller</button>
              <button onClick={() => handleDemoLogin('admin')} className="rounded-lg border border-purple-200 bg-purple-50 py-2 text-sm font-medium text-purple-600 hover:bg-purple-100">Admin</button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
