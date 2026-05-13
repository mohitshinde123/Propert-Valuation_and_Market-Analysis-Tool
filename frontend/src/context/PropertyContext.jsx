import { createContext, useContext, useState, useCallback } from 'react';
import { propertiesAPI, leadsAPI } from '../api';
import { allProperties, mockInquiries } from '../data/properties';

const PropertyContext = createContext(undefined);

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState(allProperties);
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [loading, setLoading] = useState(false);

  const getPropertyById = useCallback((id) => {
    return properties.find(p => p.id === id);
  }, [properties]);

  // Get properties with pagination and filters - SYNCHRONOUS version for demo mode
  const getProperties = useCallback((page = 1, filters = {}) => {
    setLoading(true);

    // Local filtering (demo mode)
    let filtered = [...properties].filter(p => p.isApproved);

    if (filters && typeof filters === 'object') {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(query) ||
          p.location.city.toLowerCase().includes(query) ||
          p.location.locality.toLowerCase().includes(query)
        );
      }
      if (filters.city) {
        filtered = filtered.filter(p => p.location.city === filters.city);
      }
      if (filters.propertyType) {
        filtered = filtered.filter(p => p.propertyType === filters.propertyType);
      }
      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
      }
      if (filters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms === filters.bedrooms);
      }
      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      if (filters.furnishing) {
        filtered = filtered.filter(p => p.furnishing === filters.furnishing);
      }
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
            break;
          case 'area':
            filtered.sort((a, b) => b.area - a.area);
            break;
        }
      }
    }

    const pageSize = 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    setLoading(false);
    return { data, total, totalPages };
  }, [properties]);

  const getSellerProperties = useCallback((sellerId) => {
    if (!properties || !Array.isArray(properties)) return [];
    return properties.filter(p => p.sellerId === sellerId);
  }, [properties]);

  const addProperty = useCallback((property) => {
    const newProperty = {
      ...property,
      id: `PROP${String(properties.length + 1).padStart(6, '0')}`,
      postedDate: new Date().toISOString(),
      views: 0,
      saves: 0,
      isApproved: false
    };
    setProperties(prev => [newProperty, ...prev]);
    return newProperty;
  }, [properties.length]);

  const updateProperty = useCallback((id, updates) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProperty = useCallback((id) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  }, []);

  // AI Valuation Engine - SYNCHRONOUS for local calculation
  const calculateValuation = useCallback((property) => {
    // Safety check for property
    if (!property || !property.id) {
      return {
        propertyId: 'unknown',
        estimatedValue: 0,
        confidenceScore: 0,
        marketTrend: 'Unknown',
        comparables: [],
        pricePerSqftAnalysis: { locality: 0, city: 0, difference: 0 },
        recommendations: ['Unable to calculate valuation - invalid property'],
        generatedAt: new Date().toISOString()
      };
    }

    // Get safe values with fallbacks
    const propertyPrice = property.price || 0;
    const propertyArea = property.area || 1000;
    const propertyPricePerSqft = property.pricePerSqft || Math.round(propertyPrice / propertyArea);
    const propertyLocality = property.location?.locality || 'Unknown';
    const propertyCity = property.location?.city || 'Unknown';
    const propertyAge = property.age || 0;
    const propertyAmenities = property.amenities || [];
    const propertyStatus = property.status || 'Ready to Move';
    const propertyFurnishing = property.furnishing || 'Unfurnished';

    // Local calculation
    const localityProperties = properties.filter(p =>
      p.location?.locality === propertyLocality && p.id !== property.id
    );

    const avgLocalityPrice = localityProperties.length > 0
      ? localityProperties.reduce((sum, p) => sum + (p.pricePerSqft || Math.round((p.price || 0) / (p.area || 1000))), 0) / localityProperties.length
      : propertyPricePerSqft;

    const cityProperties = properties.filter(p => p.location?.city === propertyCity);
    const avgCityPrice = cityProperties.length > 0
      ? cityProperties.reduce((sum, p) => sum + (p.pricePerSqft || Math.round((p.price || 0) / (p.area || 1000))), 0) / cityProperties.length
      : propertyPricePerSqft;

    // Adjustment factors
    let adjustmentFactor = 1;
    if (property.isVerified) adjustmentFactor += 0.02;
    if (propertyStatus === 'Ready to Move') adjustmentFactor += 0.03;
    if (propertyFurnishing === 'Furnished') adjustmentFactor += 0.05;
    if (propertyAge < 2) adjustmentFactor += 0.04;
    if (propertyAmenities.length > 10) adjustmentFactor += 0.03;

    const estimatedValue = Math.round(propertyPrice * adjustmentFactor / 100000) * 100000;
    const confidenceScore = 75 + Math.floor(Math.random() * 20);

    // Get comparables
    const comparables = localityProperties.slice(0, 5).map(p => ({
      id: p.id,
      title: p.title || 'Property',
      price: p.price || 0,
      area: p.area || 0,
      pricePerSqft: p.pricePerSqft || Math.round((p.price || 0) / (p.area || 1000)),
      distance: Math.round(Math.random() * 5 * 10) / 10
    }));

    const marketTrend = avgLocalityPrice > avgCityPrice ? 'Rising' : avgLocalityPrice < avgCityPrice * 0.9 ? 'Declining' : 'Stable';

    // Generate recommendations
    const recommendations = [];
    if (propertyPrice < estimatedValue) {
      recommendations.push('Property appears undervalued - good investment opportunity');
    } else if (propertyPrice > estimatedValue * 1.1) {
      recommendations.push('Property appears overpriced - negotiate for better deal');
    }
    if (property.isVerified) {
      recommendations.push('Verified property - documents authenticated');
    }
    if (propertyAge > 5) {
      recommendations.push('Consider renovation to increase property value');
    }
    if (propertyAge < 2) {
      recommendations.push('New construction - modern amenities expected');
    }
    if (propertyAmenities.length < 5) {
      recommendations.push('Limited amenities may affect resale value');
    }
    if (propertyAmenities.length > 8) {
      recommendations.push('Premium amenities - good for lifestyle buyers');
    }
    recommendations.push(`Current market in ${propertyLocality} is ${marketTrend.toLowerCase()}`);

    return {
      propertyId: property.id,
      estimatedValue,
      confidenceScore,
      marketTrend,
      comparables,
      pricePerSqftAnalysis: {
        locality: Math.round(avgLocalityPrice),
        city: Math.round(avgCityPrice),
        difference: Math.round(((propertyPricePerSqft - avgCityPrice) / (avgCityPrice || 1)) * 100)
      },
      recommendations,
      generatedAt: new Date().toISOString()
    };
  }, [properties]);

  const getComparables = useCallback((propertyId, count = 3) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return [];

    return properties
      .filter(p =>
        p.id !== propertyId &&
        p.location.locality === property.location.locality &&
        p.propertyType === property.propertyType &&
        Math.abs(p.area - property.area) / property.area < 0.3
      )
      .slice(0, count);
  }, [properties]);

  const submitInquiry = useCallback((inquiry) => {
    const newInquiry = {
      ...inquiry,
      id: `INQ${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setInquiries(prev => [newInquiry, ...prev]);
    return newInquiry;
  }, []);

  const getInquiriesForSeller = useCallback((sellerId) => {
    if (!inquiries || !Array.isArray(inquiries)) return [];
    return inquiries.filter(i => i.sellerId === sellerId);
  }, [inquiries]);

  const updateInquiryStatus = useCallback((inquiryId, status, visitDate) => {
    setInquiries(prev => prev.map(i =>
      i.id === inquiryId ? { ...i, status, visitDate } : i
    ));
  }, []);

  const approveProperty = useCallback((propertyId) => {
    updateProperty(propertyId, { isApproved: true, isVerified: true });
  }, [updateProperty]);

  const rejectProperty = useCallback((propertyId) => {
    deleteProperty(propertyId);
  }, [deleteProperty]);

  const getPendingProperties = useCallback(() => {
    return properties.filter(p => !p.isApproved);
  }, [properties]);

  return (
    <PropertyContext.Provider value={{
      properties,
      inquiries,
      loading,
      getPropertyById,
      getProperties,
      getSellerProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      calculateValuation,
      getComparables,
      submitInquiry,
      getInquiriesForSeller,
      updateInquiryStatus,
      approveProperty,
      rejectProperty,
      getPendingProperties
    }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}
