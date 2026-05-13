import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Search,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Heart,
  Building2,
  Shield,
  Calculator
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'Admin': return '/admin';
      case 'Seller': return '/seller/dashboard';
      default: return '/buyer/dashboard';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              Indian<span className="text-blue-600">RealEstate</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/properties"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Properties</span>
            </Link>
            <Link
              to="/market-analysis"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Market Analysis</span>
            </Link>
            <Link
              to="/valuation"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span>Valuation</span>
            </Link>
            <Link
              to="/compare"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Calculator className="h-4 w-4" />
              <span>Compare</span>
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 rounded-full bg-gray-100 px-4 py-2 hover:bg-gray-200 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5"
                    >
                      <div className="border-b px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          user?.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          user?.role === 'Seller' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user?.role}
                        </span>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        {user?.role === 'Admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        <span>Dashboard</span>
                      </Link>
                      {user?.role === 'Buyer' && (
                        <Link
                          to="/buyer/saved"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4" />
                            <span>Saved Properties</span>
                          </div>
                          {(user?.savedProperties?.length || 0) > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                              {user.savedProperties.length}
                            </span>
                          )}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                <Home className="h-5 w-5" /><span>Home</span>
              </Link>
              <Link to="/properties" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                <Search className="h-5 w-5" /><span>Properties</span>
              </Link>
              <Link to="/market-analysis" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                <BarChart3 className="h-5 w-5" /><span>Market Analysis</span>
              </Link>
              <Link to="/valuation" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                <Building2 className="h-5 w-5" /><span>Valuation</span>
              </Link>
              <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                <Calculator className="h-5 w-5" /><span>Compare</span>
              </Link>
              
              <div className="border-t pt-4">
                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                      <User className="h-5 w-5" /><span>Dashboard</span>
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex w-full items-center space-x-2 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50">
                      <LogOut className="h-5 w-5" /><span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-4 py-2 text-center text-gray-600 hover:bg-gray-100">Login</Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700">Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
