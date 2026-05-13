import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { PropertyCard } from '../components/PropertyCard';
import { formatPrice, formatDate } from '../utils/format';
import {
  User, Heart, History, MessageSquare, Settings, Home, ChevronRight,
  Building2, Eye, Calendar, TrendingUp
} from 'lucide-react';

export function BuyerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { getPropertyById } = useProperties();
  
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'Buyer' && user.role !== 'Admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('saved')) setActiveTab('saved');
    else if (path.includes('history')) setActiveTab('history');
    else if (path.includes('inquiries')) setActiveTab('inquiries');
    else setActiveTab('overview');
  }, [location]);

  // Loading state
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get saved property IDs safely
  const savedPropertyIds = useMemo(() => {
    return Array.isArray(user.savedProperties) ? user.savedProperties : [];
  }, [user.savedProperties]);

  // Get saved properties from IDs
  const savedProperties = useMemo(() => {
    return savedPropertyIds
      .map(id => getPropertyById(id))
      .filter(Boolean);
  }, [savedPropertyIds, getPropertyById]);

  // Get viewed property IDs safely
  const viewedPropertyIds = useMemo(() => {
    return Array.isArray(user.viewedProperties) ? user.viewedProperties : [];
  }, [user.viewedProperties]);

  // Get viewed properties from IDs
  const viewedProperties = useMemo(() => {
    return viewedPropertyIds
      .map(id => getPropertyById(id))
      .filter(Boolean);
  }, [viewedPropertyIds, getPropertyById]);

  const userName = user.name || 'User';
  const userEmail = user.email || '';

  const stats = [
    { label: 'Saved Properties', value: savedProperties.length, icon: Heart, color: 'bg-red-500' },
    { label: 'Properties Viewed', value: viewedProperties.length, icon: Eye, color: 'bg-blue-500' },
    { label: 'Inquiries Sent', value: 0, icon: MessageSquare, color: 'bg-green-500' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'saved', label: 'Saved Properties', icon: Heart },
    { id: 'history', label: 'View History', icon: History },
    { id: 'inquiries', label: 'My Inquiries', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {userName}!</h1>
              <p className="text-gray-500">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.id === 'saved' && savedProperties.length > 0 && (
                      <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        {savedProperties.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={stat.label} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: index * 0.1 }} 
                      className="rounded-xl bg-white p-6 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Saved */}
                {savedProperties.length > 0 && (
                  <div className="rounded-xl bg-white p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Recently Saved</h2>
                      <button onClick={() => setActiveTab('saved')} className="text-sm text-blue-600 hover:underline">
                        View All ({savedProperties.length})
                      </button>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {savedProperties.slice(0, 4).map((property) => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Saved Properties Message */}
                {savedProperties.length === 0 && (
                  <div className="rounded-xl bg-white p-6 shadow-lg">
                    <div className="py-8 text-center">
                      <Heart className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No Saved Properties Yet</h3>
                      <p className="mt-2 text-gray-500">Click the heart icon on any property to save it here.</p>
                      <Link to="/properties" className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
                        Browse Properties
                      </Link>
                    </div>
                  </div>
                )}

                {/* Market Insights */}
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    <h2 className="text-lg font-semibold">Market Insights</h2>
                  </div>
                  <p className="mt-2 text-blue-100">Stay updated with the latest market trends and investment opportunities.</p>
                  <Link to="/market-analysis" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-blue-600 hover:bg-gray-100">
                    View Analysis <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Saved Properties Tab */}
            {activeTab === 'saved' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Saved Properties ({savedProperties.length})
                </h2>
                {savedProperties.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {savedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Heart className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No Saved Properties</h3>
                    <p className="mt-2 text-gray-500">
                      Click the heart icon on any property to save it here for easy access later.
                    </p>
                    <Link to="/properties" className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
                      Browse Properties
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* View History Tab */}
            {activeTab === 'history' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  View History ({viewedProperties.length})
                </h2>
                {viewedProperties.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {viewedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <History className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No View History</h3>
                    <p className="mt-2 text-gray-500">Properties you view will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">My Inquiries</h2>
                <div className="py-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Inquiries Yet</h3>
                  <p className="mt-2 text-gray-500">
                    When you send inquiries to sellers, they will appear here.
                  </p>
                  <Link to="/properties" className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
                    Browse Properties
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
