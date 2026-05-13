import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { adminStats } from '../data/properties';
import { formatPrice, formatDate } from '../utils/format';
import toast from 'react-hot-toast';
import {
  Shield, Users, Building2, MessageSquare, BarChart3, Settings, Eye,
  CheckCircle, X, UserCheck, UserX, FileText, TrendingUp, DollarSign,
  AlertTriangle, Search, Filter, Download
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, getAllUsers, blockUser, unblockUser, updateUserRole } = useAuth();
  const { getPendingProperties, approveProperty, rejectProperty, properties, inquiries } = useProperties();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'Admin') {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Load users safely
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error('Error loading users:', error);
        setAllUsers([]);
      }
    };
    if (isAuthenticated && user?.role === 'Admin') {
      loadUsers();
    }
  }, [isAuthenticated, user, getAllUsers]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Safe array access
  const pendingProperties = getPendingProperties() || [];
  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
  const safeProperties = Array.isArray(properties) ? properties : [];

  // Safe filtering with null checks
  const filteredUsers = allUsers.filter(u => {
    if (!u) return false;
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const query = userSearchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || email.includes(query);
    const matchesFilter = userFilter === 'all' || u.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const handleApproveProperty = (id) => {
    approveProperty(id);
    toast.success('Property approved');
  };

  const handleRejectProperty = (id) => {
    if (confirm('Are you sure you want to reject this property?')) {
      rejectProperty(id);
      toast.success('Property rejected');
    }
  };

  const handleBlockUser = (id) => {
    blockUser(id);
    toast.success('User blocked');
  };

  const handleUnblockUser = (id) => {
    unblockUser(id);
    toast.success('User unblocked');
  };

  const handleUpdateRole = (id, role) => {
    updateUserRole(id, role);
    toast.success('User role updated');
  };

  const stats = [
    { label: 'Total Users', value: allUsers.length, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: 'Total Properties', value: safeProperties.length, icon: Building2, color: 'bg-green-500', change: '+8%' },
    { label: 'Pending Approvals', value: pendingProperties.length, icon: AlertTriangle, color: 'bg-amber-500', change: '-5%' },
    { label: 'Total Inquiries', value: safeInquiries.length, icon: MessageSquare, color: 'bg-purple-500', change: '+15%' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'properties', label: 'Content Moderation', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Command Center</h1>
              <p className="text-purple-100">Platform Management & Analytics</p>
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
                      activeTab === tab.id ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, index) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="rounded-xl bg-white p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                          <p className={`mt-1 text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change} from last month
                          </p>
                        </div>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <button onClick={() => setActiveTab('properties')} className="flex items-center gap-3 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-left hover:border-amber-400">
                      <AlertTriangle className="h-8 w-8 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-900">{pendingProperties.length} Pending</p>
                        <p className="text-sm text-gray-500">Properties awaiting approval</p>
                      </div>
                    </button>
                    <button onClick={() => setActiveTab('users')} className="flex items-center gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-left hover:border-blue-400">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{allUsers.length} Users</p>
                        <p className="text-sm text-gray-500">Manage platform users</p>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-4 text-left hover:border-green-400">
                      <Download className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Export Report</p>
                        <p className="text-sm text-gray-500">Download analytics data</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Pending Properties</h2>
                  <div className="mt-4 space-y-3">
                    {pendingProperties.length > 0 ? (
                      pendingProperties.slice(0, 5).map((property) => (
                        <div key={property.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'} 
                              alt="" 
                              className="h-12 w-16 rounded object-cover"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'; }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">{(property.title || '').substring(0, 35)}...</p>
                              <p className="text-sm text-gray-500">{formatPrice(property.price)} • {property.location?.city || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveProperty(property.id)} className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200">
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleRejectProperty(property.id)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <p className="mt-4 text-gray-500">All caught up! No pending properties.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="rounded-lg border pl-9 pr-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                      <option value="all">All Roles</option>
                      <option value="Buyer">Buyers</option>
                      <option value="Seller">Sellers</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-500">
                        <th className="pb-3">User</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Joined</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="border-b">
                            <td className="py-4">
                              <div>
                                <p className="font-medium text-gray-900">{u.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{u.email || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="py-4">
                              <select
                                value={u.role || 'Buyer'}
                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                className="rounded border px-2 py-1 text-sm"
                              >
                                <option value="Buyer">Buyer</option>
                                <option value="Seller">Seller</option>
                              </select>
                            </td>
                            <td className="py-4">
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${u.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {u.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                            <td className="py-4">
                              {u.isBlocked ? (
                                <button onClick={() => handleUnblockUser(u.id)} className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200">
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              ) : (
                                <button onClick={() => handleBlockUser(u.id)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200">
                                  <UserX className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900">Content Moderation</h2>
                <p className="mt-1 text-sm text-gray-500">Review and approve new property listings</p>

                {pendingProperties.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {pendingProperties.map((property) => (
                      <div key={property.id} className="rounded-lg border p-4">
                        <div className="flex gap-4">
                          <img src={property.images[0]} alt="" className="h-32 w-40 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{property.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {property.location.locality}, {property.location.city}
                            </p>
                            <p className="mt-2 font-medium text-blue-600">{formatPrice(property.price)}</p>
                            <p className="mt-1 text-sm text-gray-600">{property.area} sq.ft • {property.bedrooms} BHK</p>
                            <p className="mt-2 text-sm text-gray-500">Seller: {property.sellerName}</p>
                            <p className="mt-1 text-xs text-gray-400">Posted: {formatDate(property.postedDate)}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button onClick={() => handleApproveProperty(property.id)} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                              <CheckCircle className="h-4 w-4" /> Approve
                            </button>
                            <button onClick={() => handleRejectProperty(property.id)} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                              <X className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-12 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-4 text-gray-500">All caught up! No pending properties to review.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900">Platform Settings</h2>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900">Business Rules</h3>
                    <div className="mt-3 space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-purple-600" />
                        <span className="text-sm text-gray-700">Require admin approval for new listings</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-purple-600" />
                        <span className="text-sm text-gray-700">Enable email notifications for new inquiries</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="h-4 w-4 rounded text-purple-600" />
                        <span className="text-sm text-gray-700">Allow sellers to feature their listings (premium)</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Commission Settings</h3>
                    <div className="mt-3 flex items-center gap-4">
                      <input type="number" defaultValue={2} className="w-20 rounded-lg border px-3 py-2" />
                      <span className="text-sm text-gray-700">% platform commission per transaction</span>
                    </div>
                  </div>
                  <button className="rounded-lg bg-purple-600 px-6 py-2 font-medium text-white hover:bg-purple-700">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
