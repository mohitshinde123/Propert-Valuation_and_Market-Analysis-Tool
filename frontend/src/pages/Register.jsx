import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Buyer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const success = await register(formData.name, formData.email, formData.password, formData.phone, formData.role);
      if (success) {
        toast.success('Registration successful!');
        navigate('/');
      } else {
        toast.error('Email already exists');
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-1 text-gray-600">Join Indian RealEstate today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" required className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({ ...formData, role: 'Buyer' })} className={`rounded-lg border-2 py-3 text-center font-medium transition-colors ${formData.role === 'Buyer' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                  🏠 Buyer
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, role: 'Seller' })} className={`rounded-lg border-2 py-3 text-center font-medium transition-colors ${formData.role === 'Seller' ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  🏢 Seller
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
