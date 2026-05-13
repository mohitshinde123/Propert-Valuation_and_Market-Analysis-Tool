import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatArea, formatRelativeDate, getStatusColor } from '../utils/format';
import toast from 'react-hot-toast';
import { Heart, MapPin, Bed, Bath, Maximize, CheckCircle, Eye, ArrowRight } from 'lucide-react';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop';

export function PropertyCard({ property, showActions = true }) {
  const { user, isAuthenticated, updateSavedProperties } = useAuth();
  
  // Safety check for property
  if (!property || !property.id) {
    return null;
  }
  
  // Calculate if saved based on user's savedProperties
  const isSaved = useMemo(() => {
    const savedList = user?.savedProperties || [];
    return savedList.includes(property.id);
  }, [user?.savedProperties, property.id]);
  
  const propertyImage = property.images?.[0] || FALLBACK_IMAGE;

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to save properties');
      return;
    }
    
    // Call the context function to toggle save
    updateSavedProperties(property.id);
    
    // Show feedback
    if (isSaved) {
      toast.success('Removed from saved properties');
    } else {
      toast.success('Added to saved properties');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl"
    >
      <Link to={`/property/${property.id}`}>
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={propertyImage}
            alt={property.title || 'Property'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          />
          
          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {property.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
            )}
            {property.isFeatured && (
              <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                Featured
              </span>
            )}
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(property.status)}`}>
              {property.status}
            </span>
          </div>

          {/* Save Button */}
          {showActions && (
            <button
              onClick={handleSave}
              className={`absolute right-3 top-3 rounded-full p-2 transition-all ${
                isSaved
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save property'}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-3 left-3 rounded-lg bg-blue-600 px-3 py-1.5 text-white">
            <span className="text-lg font-bold">{formatPrice(property.price)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
            {property.title || 'Property'}
          </h3>

          <div className="mb-3 flex items-center text-gray-500">
            <MapPin className="mr-1 h-4 w-4" />
            <span className="text-sm">{property.location?.locality || 'N/A'}, {property.location?.city || 'N/A'}</span>
          </div>

          {/* Property Details */}
          {property.propertyType !== 'Plot' && (
            <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>{formatArea(property.area)}</span>
              </div>
            </div>
          )}

          {/* Property Features */}
          <div className="mb-3 flex flex-wrap gap-2">
            {property.furnishing && (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {property.furnishing}
              </span>
            )}
            {property.facing && (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {property.facing}
              </span>
            )}
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
              {!property.age || property.age === 0 ? 'New' : `${property.age} yrs old`}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {property.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {property.saves || 0}
              </span>
              <span>{property.postedDate ? formatRelativeDate(property.postedDate) : 'Recently'}</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
              View <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
