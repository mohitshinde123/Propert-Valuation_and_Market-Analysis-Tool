import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { formatPrice, formatDate } from '../utils/format';
import toast from 'react-hot-toast';
import {
  Home, Plus, List, MessageSquare, BarChart3, Settings, Eye, Heart,
  Building2, TrendingUp, Calendar, CheckCircle, X, Edit, Trash2, Phone, ExternalLink,
  Image, Upload, Camera
} from 'lucide-react';

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Independent House', 'Commercial'];
const furnishings = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const statuses = ['Ready to Move', 'Under Construction', 'New Launch'];
const facings = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

// Sample property images for fallback
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
];

// Fallback image
const FALLBACK_IMAGE = SAMPLE_IMAGES[0];

export function SellerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getSellerProperties, addProperty, deleteProperty, getInquiriesForSeller, updateInquiryStatus, inquiries } = useProperties();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    price: 0,
    area: 1000,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'Apartment',
    city: '',
    locality: '',
    address: '',
    furnishing: 'Semi-Furnished',
    status: 'Ready to Move',
    facing: 'East'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'Seller' && user?.role !== 'Admin') {
      toast.error('You need a Seller account to access this page');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;

  const myProperties = getSellerProperties(user.id) || [];
  const myInquiries = getInquiriesForSeller(user.id) || [];

  const stats = [
    { label: 'Total Listings', value: myProperties.length, icon: Building2, color: 'bg-blue-500' },
    { label: 'Active Listings', value: myProperties.filter(p => p.isApproved).length, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Total Views', value: myProperties.reduce((sum, p) => sum + p.views, 0), icon: Eye, color: 'bg-purple-500' },
    { label: 'Total Saves', value: myProperties.reduce((sum, p) => sum + p.saves, 0), icon: Heart, color: 'bg-red-500' }
  ];

  // Image handling functions
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (uploadedImages.length + validFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          preview: reader.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const resetForm = () => {
    setNewProperty({
      title: '', description: '', price: 0, area: 1000, bedrooms: 2, bathrooms: 2,
      propertyType: 'Apartment', city: '', locality: '', address: '', furnishing: 'Semi-Furnished',
      status: 'Ready to Move', facing: 'East'
    });
    setUploadedImages([]);
  };

  const handleAddProperty = () => {
    if (!newProperty.title || !newProperty.city) {
      toast.error('Please fill required fields (Title and City)');
      return;
    }

    if (!newProperty.locality) {
      toast.error('Please enter locality');
      return;
    }

    if (newProperty.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (newProperty.area <= 0) {
      toast.error('Please enter a valid area');
      return;
    }

    // Use uploaded images or fallback to sample images
    const propertyImages = uploadedImages.length > 0 
      ? uploadedImages.map(img => img.preview)
      : [SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]];

    const property = {
      ...newProperty,
      pricePerSqft: Math.round(newProperty.price / newProperty.area),
      areaUnit: 'sqft',
      balconies: 1,
      floor: '5',
      totalFloors: 10,
      age: 0,
      location: {
        address: newProperty.address || `${newProperty.locality}, ${newProperty.city}`,
        locality: newProperty.locality,
        city: newProperty.city,
        state: getCityState(newProperty.city),
        pincode: '110001',
        latitude: 12.9716,
        longitude: 77.5946
      },
      amenities: ['Parking', 'Security', 'Lift'],
      images: propertyImages,
      sellerId: user.id,
      sellerName: user.name,
      sellerPhone: user.phone,
      isVerified: false,
      isFeatured: false
    };

    addProperty(property);
    toast.success('Property added successfully! Pending admin approval.');
    setShowAddProperty(false);
    resetForm();
  };

  // Helper function to get state from city
  const getCityState = (city) => {
    const stateMap = {
      'Mumbai': 'Maharashtra',
      'Pune': 'Maharashtra',
      'Delhi': 'Delhi',
      'Bangalore': 'Karnataka',
      'Hyderabad': 'Telangana',
      'Chennai': 'Tamil Nadu',
      'Kolkata': 'West Bengal',
      'Ahmedabad': 'Gujarat'
    };
    return stateMap[city] || 'India';
  };

  const handleDeleteProperty = (id) => {
    if (confirm('Are you sure you want to delete this property?')) {
      deleteProperty(id);
      toast.success('Property deleted');
    }
  };

  const handleUpdateInquiryStatus = (inquiryId, status) => {
    updateInquiryStatus(inquiryId, status);
    toast.success('Inquiry status updated');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'listings', label: 'My Listings', icon: List },
    { id: 'inquiries', label: 'Lead Management', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-600">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
                <p className="text-gray-500">{user.name}</p>
              </div>
            </div>
            <button onClick={() => setShowAddProperty(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
              <Plus className="h-5 w-5" /> Add Property
            </button>
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
                      activeTab === tab.id ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'
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
                <div className="grid gap-4 md:grid-cols-4">
                  {stats.map((stat, index) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="rounded-xl bg-white p-6 shadow-lg">
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

                {/* Recent Listings */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-gray-500">
                          <th className="pb-3">Property</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myProperties.slice(0, 5).map((property) => (
                          <tr key={property.id} className="border-b">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={property.images?.[0] || FALLBACK_IMAGE} 
                                  alt="" 
                                  className="h-12 w-16 rounded object-cover"
                                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{(property.title || '').substring(0, 30)}...</p>
                                  <p className="text-sm text-gray-500">{property.location?.city || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-medium">{formatPrice(property.price)}</td>
                            <td className="py-3">
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${property.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {property.isApproved ? 'Active' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-3">{property.views || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">My Listings ({myProperties.length})</h2>
                  <button 
                    onClick={() => setShowAddProperty(true)} 
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" /> Add New
                  </button>
                </div>
                {myProperties.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-gray-500">
                          <th className="pb-3">Property</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Views</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myProperties.map((property) => (
                          <tr key={property.id} className="border-b">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={property.images?.[0] || FALLBACK_IMAGE} 
                                  alt="" 
                                  className="h-16 w-20 rounded object-cover"
                                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{(property.title || '').substring(0, 35)}...</p>
                                  <p className="text-sm text-gray-500">{property.location?.locality || 'N/A'}, {property.location?.city || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 font-medium">{formatPrice(property.price)}</td>
                            <td className="py-4">
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${property.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {property.isApproved ? 'Active' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Eye className="h-4 w-4" /> {property.views || 0}
                                <Heart className="h-4 w-4 ml-2" /> {property.saves || 0}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <Link 
                                  to={`/property/${property.id}`}
                                  className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                                <button className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteProperty(property.id)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-gray-500">No properties listed yet</p>
                    <button 
                      onClick={() => setShowAddProperty(true)}
                      className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
                    >
                      Add Your First Property
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Lead Management ({myInquiries.length})</h2>
                {myInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {myInquiries.map((inquiry) => {
                      const property = myProperties.find(p => p.id === inquiry.propertyId);
                      return (
                        <div key={inquiry.id} className="rounded-lg border p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{inquiry.buyerName}</p>
                              <p className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" /> {inquiry.buyerPhone}
                              </p>
                              <p className="mt-2 text-sm text-gray-600">{inquiry.message}</p>
                              {property && (
                                <p className="mt-1 text-xs text-gray-500">Re: {property.title.substring(0, 40)}...</p>
                              )}
                              <p className="mt-1 text-xs text-gray-400">{formatDate(inquiry.createdAt)}</p>
                            </div>
                            <div className="flex gap-2">
                              <select
                                value={inquiry.status}
                                onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value)}
                                className="rounded-lg border px-3 py-1 text-sm"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-gray-500">No inquiries yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg bg-blue-50 p-6">
                    <h3 className="font-medium text-blue-900">Total Views</h3>
                    <p className="mt-2 text-4xl font-bold text-blue-600">{myProperties.reduce((sum, p) => sum + p.views, 0)}</p>
                    <p className="mt-1 text-sm text-blue-700">+12% from last month</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-6">
                    <h3 className="font-medium text-green-900">Conversion Rate</h3>
                    <p className="mt-2 text-4xl font-bold text-green-600">4.2%</p>
                    <p className="mt-1 text-sm text-green-700">Views to inquiries</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Property Modal */}
      {showAddProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add New Property</h2>
              <button onClick={() => setShowAddProperty(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                <input 
                  type="text" 
                  value={newProperty.title} 
                  onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })} 
                  placeholder="e.g., 2 BHK in Andheri West" 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
                <select 
                  value={newProperty.city} 
                  onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })} 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select City</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Locality *</label>
                <input 
                  type="text" 
                  value={newProperty.locality} 
                  onChange={(e) => setNewProperty({ ...newProperty, locality: e.target.value })} 
                  placeholder="e.g., Andheri West" 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price (₹) *</label>
                <input 
                  type="number" 
                  value={newProperty.price || ''} 
                  onChange={(e) => setNewProperty({ ...newProperty, price: Number(e.target.value) || 0 })} 
                  placeholder="e.g., 5000000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Area (sq.ft) *</label>
                <input 
                  type="number" 
                  value={newProperty.area || ''} 
                  onChange={(e) => setNewProperty({ ...newProperty, area: Number(e.target.value) || 0 })} 
                  placeholder="e.g., 1200"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Property Type</label>
                <select 
                  value={newProperty.propertyType} 
                  onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value })} 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bedrooms</label>
                <select 
                  value={newProperty.bedrooms} 
                  onChange={(e) => setNewProperty({ ...newProperty, bedrooms: Number(e.target.value) })} 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bathrooms</label>
                <select 
                  value={newProperty.bathrooms} 
                  onChange={(e) => setNewProperty({ ...newProperty, bathrooms: Number(e.target.value) })} 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Furnishing</label>
                <select 
                  value={newProperty.furnishing} 
                  onChange={(e) => setNewProperty({ ...newProperty, furnishing: e.target.value })} 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {furnishings.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select 
                  value={newProperty.status} 
                  onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value })} 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Facing</label>
                <select 
                  value={newProperty.facing} 
                  onChange={(e) => setNewProperty({ ...newProperty, facing: e.target.value })} 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {facings.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={newProperty.description} 
                  onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })} 
                  rows={3} 
                  placeholder="Describe your property..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <input 
                  type="text" 
                  value={newProperty.address} 
                  onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })} 
                  placeholder="Full address"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
                />
              </div>

              {/* Image Upload Section */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Property Images (Max 10)
                </label>
                
                {/* Drag & Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center">
                    <div className="mb-3 rounded-full bg-blue-100 p-3">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      {isDragging ? 'Drop images here' : 'Click or drag images to upload'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG up to 5MB each
                    </p>
                  </div>
                </div>

                {/* Image Previews */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Uploaded Images ({uploadedImages.length}/10)
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {uploadedImages.map((img, index) => (
                        <div key={img.id} className="group relative">
                          <img
                            src={img.preview}
                            alt={`Upload ${index + 1}`}
                            className="h-20 w-full rounded-lg object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add more button */}
                      {uploadedImages.length < 10 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      💡 First image will be the main display image
                    </p>
                  </div>
                )}

                {/* Sample Images Option */}
                {uploadedImages.length === 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-500">Or use sample images:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {SAMPLE_IMAGES.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setUploadedImages([{
                            id: Date.now() + index,
                            file: null,
                            preview: img,
                            name: `sample-${index + 1}.jpg`
                          }])}
                          className="overflow-hidden rounded-lg border-2 border-transparent hover:border-blue-500"
                        >
                          <img
                            src={img}
                            alt={`Sample ${index + 1}`}
                            className="h-16 w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleAddProperty} className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                <span className="flex items-center justify-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Add Property
                </span>
              </button>
              <button 
                onClick={() => { setShowAddProperty(false); resetForm(); }} 
                className="rounded-lg border px-6 py-3 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
