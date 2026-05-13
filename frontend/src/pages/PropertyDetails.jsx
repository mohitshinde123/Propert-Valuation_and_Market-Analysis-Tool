import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { EMICalculator } from '../components/EMICalculator';
import { generateValuationReport } from '../utils/pdfGenerator';
import { formatPrice, formatArea, formatDate, getStatusColor } from '../utils/format';
import toast from 'react-hot-toast';
import {
  Heart, Share2, MapPin, Bed, Bath, Maximize, Calendar, CheckCircle,
  Download, Phone, Mail, ArrowLeft, ChevronLeft, ChevronRight,
  Building2, TrendingUp, Shield, Clock, Compass
} from 'lucide-react';

export function PropertyDetails() {
  const { id } = useParams();
  const { getPropertyById, calculateValuation, getComparables, submitInquiry } = useProperties();
  const { user, isAuthenticated, updateSavedProperties } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [comparables, setComparables] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      const prop = getPropertyById(id);
      setProperty(prop || null);
      if (prop) {
        setComparables(getComparables(id, 3));
      }
    }
  }, [id, getPropertyById, getComparables]);

  // Calculate if saved based on user's savedProperties
  const isSaved = useMemo(() => {
    if (!property) return false;
    const savedList = user?.savedProperties || [];
    return savedList.includes(property.id);
  }, [user?.savedProperties, property?.id]);

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-2xl font-bold text-gray-700">Property Not Found</h2>
          <Link to="/properties" className="mt-4 inline-block text-blue-600 hover:underline">Browse All Properties</Link>
        </div>
      </div>
    );
  }

  const valuation = calculateValuation(property);

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save properties');
      return;
    }
    
    updateSavedProperties(property.id);
    
    // Show feedback based on current state
    if (isSaved) {
      toast.success('Removed from saved properties');
    } else {
      toast.success('Added to saved properties');
    }
  };

  const handleDownloadReport = () => {
    try {
      generateValuationReport(property, valuation);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const handleSubmitInquiry = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to send inquiry');
      return;
    }
    
    submitInquiry({
      propertyId: property.id,
      buyerId: user.id,
      buyerName: user.name,
      buyerPhone: user.phone,
      sellerId: property.sellerId,
      message: inquiryMessage,
      visitDate: visitDate || undefined
    });
    
    toast.success('Inquiry sent successfully!');
    setShowContactForm(false);
    setInquiryMessage('');
    setVisitDate('');
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % property.images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/properties" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to Properties
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative overflow-hidden rounded-xl">
              <img src={property.images[currentImage]} alt={property.title} className="h-[400px] w-full object-cover" />
              
              {property.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {property.images.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentImage(idx)} className={`h-2 w-2 rounded-full transition-colors ${idx === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>

              <div className="absolute left-4 top-4 flex gap-2">
                {property.isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                    <CheckCircle className="h-4 w-4" /> Verified
                  </span>
                )}
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {property.images.map((img, idx) => (
                <button key={idx} onClick={() => setCurrentImage(idx)} className={`flex-shrink-0 overflow-hidden rounded-lg border-2 ${idx === currentImage ? 'border-blue-600' : 'border-transparent'}`}>
                  <img src={img} alt="" className="h-20 w-28 object-cover" />
                </button>
              ))}
            </div>

            {/* Property Header */}
            <div className="mt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                  <div className="mt-2 flex items-center text-gray-600">
                    <MapPin className="mr-1 h-5 w-5" />
                    <span>{property.location.address}, {property.location.locality}, {property.location.city} - {property.location.pincode}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className={`rounded-full p-3 transition-all ${isSaved ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}>
                    <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="rounded-full bg-gray-100 p-3 text-gray-600 hover:bg-gray-200">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="text-3xl font-bold text-blue-600">{formatPrice(property.price)}</span>
                <span className="text-gray-500">₹{property.pricePerSqft.toLocaleString()}/sq.ft</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b">
              <div className="flex gap-6">
                {['details', 'amenities', 'emi'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 pb-3 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'emi' ? 'EMI Calculator' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <>
                {/* Property Details */}
                <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">Property Details</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {property.propertyType !== 'Plot' && (
                      <>
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                          <Bed className="h-6 w-6 text-blue-600" />
                          <div><div className="text-sm text-gray-500">Bedrooms</div><div className="font-semibold">{property.bedrooms}</div></div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                          <Bath className="h-6 w-6 text-blue-600" />
                          <div><div className="text-sm text-gray-500">Bathrooms</div><div className="font-semibold">{property.bathrooms}</div></div>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                      <Maximize className="h-6 w-6 text-blue-600" />
                      <div><div className="text-sm text-gray-500">Area</div><div className="font-semibold">{formatArea(property.area)}</div></div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                      <Compass className="h-6 w-6 text-blue-600" />
                      <div><div className="text-sm text-gray-500">Facing</div><div className="font-semibold">{property.facing}</div></div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                      <Building2 className="h-6 w-6 text-blue-600" />
                      <div><div className="text-sm text-gray-500">Type</div><div className="font-semibold">{property.propertyType}</div></div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                      <Clock className="h-6 w-6 text-blue-600" />
                      <div><div className="text-sm text-gray-500">Age</div><div className="font-semibold">{property.age === 0 ? 'New' : `${property.age} years`}</div></div>
                    </div>
                    {property.propertyType !== 'Plot' && (
                      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <div><div className="text-sm text-gray-500">Floor</div><div className="font-semibold">{property.floor} of {property.totalFloors}</div></div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                      <Shield className="h-6 w-6 text-blue-600" />
                      <div><div className="text-sm text-gray-500">Furnishing</div><div className="font-semibold">{property.furnishing}</div></div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">Description</h2>
                  <p className="text-gray-600">{property.description}</p>
                </div>
              </>
            )}

            {activeTab === 'amenities' && (
              <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span key={amenity} className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">{amenity}</span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'emi' && <div className="mt-6"><EMICalculator propertyPrice={property.price} /></div>}

            {/* Comparable Properties */}
            {comparables.length > 0 && (
              <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Similar Properties</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {comparables.map((comp) => (
                    <PropertyCard key={comp.id} property={comp} showActions={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Valuation Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <h3 className="text-lg font-semibold">AI Valuation</h3>
              </div>
              <div className="mt-4 text-3xl font-bold">{formatPrice(valuation.estimatedValue)}</div>
              <div className="mt-2 flex items-center gap-2 text-blue-100">
                <span>Confidence: {valuation.confidenceScore}%</span>
                <span>•</span>
                <span>Market: {valuation.marketTrend}</span>
              </div>
              <button onClick={handleDownloadReport} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-semibold text-blue-600 hover:bg-gray-100">
                <Download className="h-5 w-5" /> Download Report
              </button>
            </motion.div>

            {/* Contact Seller Card */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900">Contact Seller</h3>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                  {property.sellerName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{property.sellerName}</div>
                  <div className="text-sm text-gray-500">Property Owner</div>
                </div>
              </div>

              {showContactForm ? (
                <div className="mt-4 space-y-4">
                  <textarea value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)} placeholder="I'm interested in this property..." className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none" rows={3} />
                  <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={handleSubmitInquiry} className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">Send Inquiry</button>
                    <button onClick={() => setShowContactForm(false)} className="rounded-lg border border-gray-300 px-4 py-3 text-gray-600 hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <a href={`tel:${property.sellerPhone}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                    <Phone className="h-5 w-5" /> {property.sellerPhone}
                  </a>
                  <button onClick={() => setShowContactForm(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 py-3 font-semibold text-blue-600 hover:bg-blue-50">
                    <Mail className="h-5 w-5" /> Send Message
                  </button>
                  <button onClick={() => setShowContactForm(true)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700">
                    <Calendar className="h-5 w-5" /> Book a Visit
                  </button>
                </div>
              )}
            </div>

            {/* Posted Date */}
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <div className="text-sm text-gray-500">Posted on {formatDate(property.postedDate)}</div>
              <div className="mt-2 flex gap-4 text-sm text-gray-500">
                <span>{property.views} views</span>
                <span>{property.saves} saves</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
