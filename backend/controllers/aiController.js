import Property from '../models/Property.js';

// @desc    AI Property Valuation
// @route   POST /api/ai/valuation
// @access  Public
export const getPropertyValuation = async (req, res) => {
  try {
    const { 
      propertyId, 
      city, 
      locality, 
      area, 
      propertyType, 
      bedrooms, 
      age, 
      furnishing,
      floor,
      totalFloors 
    } = req.body;

    let property = null;
    let baseArea = area || 1000;
    let baseCity = city || 'Mumbai';
    let baseLocality = locality || 'Central';
    let basePropertyType = propertyType || 'Apartment';
    let baseBedrooms = bedrooms || 2;
    let baseAge = age || 0;

    // If propertyId provided, fetch property details
    if (propertyId) {
      property = await Property.findById(propertyId);
      if (property) {
        baseArea = property.area;
        baseCity = property.location.city;
        baseLocality = property.location.locality;
        basePropertyType = property.propertyType;
        baseBedrooms = property.bedrooms;
        baseAge = property.age;
      }
    }

    // Get comparable properties from same locality
    const localityProperties = await Property.find({
      'location.locality': new RegExp(baseLocality, 'i'),
      'location.city': new RegExp(baseCity, 'i'),
      isApproved: true,
      ...(propertyId && { _id: { $ne: propertyId } })
    }).limit(20);

    // Get city-wide average
    const cityProperties = await Property.find({
      'location.city': new RegExp(baseCity, 'i'),
      isApproved: true
    });

    // Calculate averages
    let avgLocalityPricePerSqft = 5000;
    let avgCityPricePerSqft = 5000;

    if (localityProperties.length > 0) {
      avgLocalityPricePerSqft = Math.round(
        localityProperties.reduce((sum, p) => sum + (p.pricePerSqft || p.price / p.area), 0) / localityProperties.length
      );
    }

    if (cityProperties.length > 0) {
      avgCityPricePerSqft = Math.round(
        cityProperties.reduce((sum, p) => sum + (p.pricePerSqft || p.price / p.area), 0) / cityProperties.length
      );
    }

    // AI Adjustment Factors
    let adjustmentFactor = 1.0;
    const adjustments = [];

    // Property type adjustment
    const typeMultiplier = {
      'Apartment': 1.0,
      'Villa': 1.15,
      'Penthouse': 1.25,
      'Independent House': 1.10,
      'Plot': 0.7,
      'Commercial': 1.2,
      'Studio': 0.85
    };
    if (typeMultiplier[basePropertyType]) {
      adjustmentFactor *= typeMultiplier[basePropertyType];
      adjustments.push({
        factor: 'Property Type',
        value: `${basePropertyType}`,
        impact: `${((typeMultiplier[basePropertyType] - 1) * 100).toFixed(1)}%`
      });
    }

    // Age adjustment (newer = higher value)
    if (baseAge < 2) {
      adjustmentFactor *= 1.08;
      adjustments.push({ factor: 'New Construction', value: `${baseAge} years`, impact: '+8%' });
    } else if (baseAge < 5) {
      adjustmentFactor *= 1.04;
      adjustments.push({ factor: 'Recent Construction', value: `${baseAge} years`, impact: '+4%' });
    } else if (baseAge > 15) {
      adjustmentFactor *= 0.92;
      adjustments.push({ factor: 'Older Property', value: `${baseAge} years`, impact: '-8%' });
    }

    // Furnishing adjustment
    const furnishingBonus = {
      'Furnished': 1.08,
      'Semi-Furnished': 1.03,
      'Unfurnished': 1.0
    };
    if (furnishing && furnishingBonus[furnishing]) {
      adjustmentFactor *= furnishingBonus[furnishing];
      adjustments.push({
        factor: 'Furnishing',
        value: furnishing,
        impact: `${((furnishingBonus[furnishing] - 1) * 100).toFixed(1)}%`
      });
    }

    // Floor adjustment (higher floors in apartments = premium)
    if (basePropertyType === 'Apartment' && floor && totalFloors) {
      const floorNum = parseInt(floor);
      const totalFloorsNum = parseInt(totalFloors);
      if (floorNum > totalFloorsNum * 0.7) {
        adjustmentFactor *= 1.03;
        adjustments.push({ factor: 'Higher Floor', value: `${floor}/${totalFloors}`, impact: '+3%' });
      }
    }

    // Bedrooms adjustment
    if (baseBedrooms >= 3) {
      adjustmentFactor *= 1.02;
      adjustments.push({ factor: '3+ BHK Premium', value: `${baseBedrooms} BHK`, impact: '+2%' });
    }

    // Calculate estimated value
    const basePrice = baseArea * avgLocalityPricePerSqft;
    const estimatedValue = Math.round(basePrice * adjustmentFactor / 100000) * 100000;
    const pricePerSqft = Math.round(estimatedValue / baseArea);

    // Confidence score based on data availability
    let confidenceScore = 60;
    if (localityProperties.length > 10) confidenceScore += 15;
    else if (localityProperties.length > 5) confidenceScore += 10;
    else if (localityProperties.length > 0) confidenceScore += 5;
    if (property) confidenceScore += 10;
    if (cityProperties.length > 50) confidenceScore += 10;
    confidenceScore = Math.min(confidenceScore, 95);

    // Market trend analysis
    const recentProperties = localityProperties.filter(p => {
      const postedDate = new Date(p.createdAt);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return postedDate > threeMonthsAgo;
    });

    let marketTrend = 'Stable';
    if (recentProperties.length > 5) {
      const recentAvg = recentProperties.reduce((sum, p) => sum + p.pricePerSqft, 0) / recentProperties.length;
      if (recentAvg > avgLocalityPricePerSqft * 1.05) {
        marketTrend = 'Rising';
      } else if (recentAvg < avgLocalityPricePerSqft * 0.95) {
        marketTrend = 'Declining';
      }
    }

    // Get comparable properties
    const comparables = localityProperties
      .filter(p => {
        const areaDiff = Math.abs(p.area - baseArea) / baseArea;
        return areaDiff < 0.3; // Within 30% area difference
      })
      .slice(0, 5)
      .map(p => ({
        id: p._id,
        title: p.title,
        price: p.price,
        area: p.area,
        pricePerSqft: Math.round(p.price / p.area),
        bedrooms: p.bedrooms,
        location: `${p.location.locality}, ${p.location.city}`,
        age: p.age
      }));

    // AI Recommendations
    const recommendations = [];

    if (estimatedValue > (property?.price || estimatedValue) * 1.1) {
      recommendations.push('📈 Property appears undervalued - good investment opportunity');
    } else if (estimatedValue < (property?.price || estimatedValue) * 0.9) {
      recommendations.push('📉 Property appears overvalued - negotiate for better price');
    }

    if (marketTrend === 'Rising') {
      recommendations.push('🚀 Market is rising - consider buying soon');
    } else if (marketTrend === 'Declining') {
      recommendations.push('⏳ Market is declining - wait for better prices or negotiate hard');
    }

    if (baseAge > 10) {
      recommendations.push('🔧 Consider renovation to increase property value');
    }

    if (avgLocalityPricePerSqft > avgCityPricePerSqft * 1.2) {
      recommendations.push('⭐ Premium locality - expect good appreciation');
    }

    if (baseBedrooms >= 3 && basePropertyType === 'Apartment') {
      recommendations.push('👨‍👩‍👧‍👦 Good for families - 3+ BHK has strong resale demand');
    }

    recommendations.push(`📍 ${baseLocality} is a ${avgLocalityPricePerSqft > avgCityPricePerSqft ? 'premium' : 'value'} locality in ${baseCity}`);

    // Investment score (1-10)
    let investmentScore = 5;
    if (marketTrend === 'Rising') investmentScore += 2;
    if (baseAge < 3) investmentScore += 1;
    if (avgLocalityPricePerSqft < avgCityPricePerSqft) investmentScore += 1;
    if (localityProperties.length > 10) investmentScore += 1;
    investmentScore = Math.min(Math.max(investmentScore, 1), 10);

    res.status(200).json({
      success: true,
      valuation: {
        estimatedValue,
        pricePerSqft,
        confidenceScore,
        marketTrend,
        investmentScore,
        
        priceAnalysis: {
          localityAvg: avgLocalityPricePerSqft,
          cityAvg: avgCityPricePerSqft,
          difference: Math.round(((pricePerSqft - avgCityPricePerSqft) / avgCityPricePerSqft) * 100),
          propertyType: basePropertyType,
          area: baseArea
        },

        adjustments,
        comparables,
        recommendations,

        marketInsights: {
          totalLocalityListings: localityProperties.length,
          recentListings: recentProperties.length,
          demandLevel: localityProperties.length > 10 ? 'High' : localityProperties.length > 5 ? 'Medium' : 'Low'
        },

        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Valuation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating property valuation'
    });
  }
};

// @desc    AI Market Analysis
// @route   GET /api/ai/market-analysis
// @access  Public
export const getMarketAnalysis = async (req, res) => {
  try {
    const { city } = req.query;

    let cityFilter = {};
    if (city) {
      cityFilter = { 'location.city': new RegExp(city, 'i') };
    }

    // Get all approved properties
    const properties = await Property.find({
      isApproved: true,
      ...cityFilter
    });

    // Calculate overall stats
    const totalListings = properties.length;
    const avgPrice = properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length)
      : 0;
    const avgPricePerSqft = properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + (p.pricePerSqft || p.price / p.area), 0) / properties.length)
      : 0;

    // Property type distribution
    const typeDistribution = {};
    properties.forEach(p => {
      typeDistribution[p.propertyType] = (typeDistribution[p.propertyType] || 0) + 1;
    });
    const propertyTypeDistribution = Object.entries(typeDistribution).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalListings) * 100)
    }));

    // City-wise distribution
    const cityDistribution = {};
    properties.forEach(p => {
      const propCity = p.location.city;
      if (!cityDistribution[propCity]) {
        cityDistribution[propCity] = { count: 0, totalPrice: 0, totalArea: 0 };
      }
      cityDistribution[propCity].count++;
      cityDistribution[propCity].totalPrice += p.price;
      cityDistribution[propCity].totalArea += p.area;
    });

    const topCities = Object.entries(cityDistribution)
      .map(([cityName, data]) => ({
        city: cityName,
        listings: data.count,
        avgPrice: Math.round(data.totalPrice / data.count),
        avgPricePerSqft: Math.round(data.totalPrice / data.totalArea)
      }))
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 10);

    // Top localities
    const localityDistribution = {};
    properties.forEach(p => {
      const key = `${p.location.locality}, ${p.location.city}`;
      if (!localityDistribution[key]) {
        localityDistribution[key] = { count: 0, totalPrice: 0 };
      }
      localityDistribution[key].count++;
      localityDistribution[key].totalPrice += p.price;
    });

    const topLocalities = Object.entries(localityDistribution)
      .map(([name, data]) => ({
        name,
        listings: data.count,
        avgPrice: Math.round(data.totalPrice / data.count)
      }))
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 10);

    // Price range distribution
    const priceRanges = {
      'Under 50 Lac': 0,
      '50 Lac - 1 Cr': 0,
      '1 Cr - 2 Cr': 0,
      '2 Cr - 5 Cr': 0,
      'Above 5 Cr': 0
    };

    properties.forEach(p => {
      if (p.price < 5000000) priceRanges['Under 50 Lac']++;
      else if (p.price < 10000000) priceRanges['50 Lac - 1 Cr']++;
      else if (p.price < 20000000) priceRanges['1 Cr - 2 Cr']++;
      else if (p.price < 50000000) priceRanges['2 Cr - 5 Cr']++;
      else priceRanges['Above 5 Cr']++;
    });

    // Bedroom distribution
    const bedroomDistribution = {};
    properties.forEach(p => {
      const bhk = `${p.bedrooms} BHK`;
      bedroomDistribution[bhk] = (bedroomDistribution[bhk] || 0) + 1;
    });

    // Monthly price trends (simulated based on creation dates)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthProperties = properties.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.getMonth() === date.getMonth() && pDate.getFullYear() === date.getFullYear();
      });

      const monthAvg = monthProperties.length > 0
        ? Math.round(monthProperties.reduce((sum, p) => sum + p.price, 0) / monthProperties.length)
        : avgPrice;

      monthlyTrends.push({
        month: monthName,
        avgPrice: monthAvg,
        listings: monthProperties.length
      });
    }

    // Investment hotspots
    const investmentHotspots = topLocalities.slice(0, 5).map((loc, idx) => ({
      rank: idx + 1,
      locality: loc.name,
      avgPrice: loc.avgPrice,
      listings: loc.listings,
      potential: loc.avgPrice < avgPrice ? 'High Growth Potential' : 'Stable Investment'
    }));

    res.status(200).json({
      success: true,
      analysis: {
        overview: {
          totalListings,
          avgPrice,
          avgPricePerSqft,
          activeCities: Object.keys(cityDistribution).length
        },
        propertyTypeDistribution,
        topCities,
        topLocalities,
        priceRangeDistribution: Object.entries(priceRanges).map(([range, count]) => ({
          range,
          count,
          percentage: Math.round((count / totalListings) * 100)
        })),
        bedroomDistribution: Object.entries(bedroomDistribution).map(([bhk, count]) => ({
          bhk,
          count
        })),
        monthlyTrends,
        investmentHotspots,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating market analysis'
    });
  }
};

// @desc    AI Property Recommendations
// @route   POST /api/ai/recommendations
// @access  Private
export const getPropertyRecommendations = async (req, res) => {
  try {
    const { 
      budget, 
      preferredCities, 
      preferredType, 
      bedrooms, 
      purpose // 'investment' or 'self-use'
    } = req.body;

    // Build query based on preferences
    let query = { isApproved: true };

    if (budget) {
      query.price = { $lte: budget };
    }

    if (preferredCities && preferredCities.length > 0) {
      query['location.city'] = { $in: preferredCities.map(c => new RegExp(c, 'i')) };
    }

    if (preferredType) {
      query.propertyType = preferredType;
    }

    if (bedrooms) {
      query.bedrooms = { $gte: bedrooms };
    }

    let properties = await Property.find(query).limit(50);

    // Score each property based on purpose
    const scoredProperties = properties.map(p => {
      let score = 50; // Base score

      // Price value (lower price per sqft = better value)
      const pricePerSqft = p.pricePerSqft || (p.price / p.area);
      if (pricePerSqft < 5000) score += 15;
      else if (pricePerSqft < 8000) score += 10;
      else if (pricePerSqft < 12000) score += 5;

      // Age factor
      if (p.age < 2) score += 10;
      else if (p.age < 5) score += 5;
      else if (p.age > 15) score -= 10;

      // Amenities factor
      score += Math.min(p.amenities?.length || 0, 10);

      // Verified property bonus
      if (p.isVerified) score += 5;

      // Investment specific scoring
      if (purpose === 'investment') {
        // Prefer under-construction for investment
        if (p.status === 'Under Construction') score += 10;
        if (p.status === 'New Launch') score += 15;
        // Prefer 2-3 BHK for rental demand
        if (p.bedrooms === 2 || p.bedrooms === 3) score += 10;
      }

      // Self-use specific scoring
      if (purpose === 'self-use') {
        // Prefer ready to move
        if (p.status === 'Ready to Move') score += 15;
        // Prefer furnished
        if (p.furnishing === 'Furnished') score += 10;
        if (p.furnishing === 'Semi-Furnished') score += 5;
      }

      return {
        ...p.toObject(),
        aiScore: Math.min(score, 100),
        matchReasons: getMatchReasons(p, purpose, budget)
      };
    });

    // Sort by score and return top recommendations
    const recommendations = scoredProperties
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
      searchCriteria: {
        budget,
        preferredCities,
        preferredType,
        bedrooms,
        purpose
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations'
    });
  }
};

// Helper function to generate match reasons
function getMatchReasons(property, purpose, budget) {
  const reasons = [];

  if (budget && property.price <= budget * 0.9) {
    reasons.push('💰 Under budget - room for negotiation');
  }

  if (property.age < 2) {
    reasons.push('🆕 New construction');
  }

  if (property.isVerified) {
    reasons.push('✅ Verified property');
  }

  if (property.status === 'Ready to Move') {
    reasons.push('🏠 Ready to move in');
  }

  if (property.amenities?.length > 8) {
    reasons.push('🎯 Premium amenities');
  }

  if (purpose === 'investment') {
    if (property.status === 'Under Construction' || property.status === 'New Launch') {
      reasons.push('📈 High appreciation potential');
    }
    if (property.bedrooms === 2 || property.bedrooms === 3) {
      reasons.push('👥 High rental demand');
    }
  }

  if (purpose === 'self-use') {
    if (property.furnishing === 'Furnished' || property.furnishing === 'Semi-Furnished') {
      reasons.push('🪑 Furnished - move in ready');
    }
    if (property.bedrooms >= 3) {
      reasons.push('👨‍👩‍👧‍👦 Family friendly');
    }
  }

  return reasons;
}

// @desc    AI Price Prediction
// @route   POST /api/ai/price-prediction
// @access  Public
export const getPricePrediction = async (req, res) => {
  try {
    const { city, locality, propertyType, years = 5 } = req.body;

    // Get historical data (simulated)
    const properties = await Property.find({
      'location.city': new RegExp(city || 'Mumbai', 'i'),
      ...(locality && { 'location.locality': new RegExp(locality, 'i') }),
      ...(propertyType && { propertyType }),
      isApproved: true
    });

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No properties found for prediction'
      });
    }

    // Calculate current average
    const currentAvgPrice = Math.round(
      properties.reduce((sum, p) => sum + p.price, 0) / properties.length
    );
    const currentAvgPricePerSqft = Math.round(
      properties.reduce((sum, p) => sum + (p.pricePerSqft || p.price / p.area), 0) / properties.length
    );

    // Estimate appreciation rate (based on city and property type)
    const appreciationRates = {
      'Mumbai': 0.08,
      'Delhi': 0.07,
      'Bangalore': 0.10,
      'Hyderabad': 0.12,
      'Chennai': 0.06,
      'Pune': 0.09,
      'Kolkata': 0.05,
      'Ahmedabad': 0.07
    };

    const baseRate = appreciationRates[city] || 0.07;

    // Property type adjustment
    const typeAdjustment = {
      'Apartment': 1.0,
      'Villa': 1.1,
      'Plot': 1.2, // Plots appreciate faster
      'Commercial': 0.9,
      'Independent House': 1.05
    };

    const rate = baseRate * (typeAdjustment[propertyType] || 1.0);

    // Generate predictions
    const predictions = [];
    let predictedPrice = currentAvgPrice;

    for (let year = 1; year <= years; year++) {
      predictedPrice = Math.round(predictedPrice * (1 + rate));
      predictions.push({
        year: new Date().getFullYear() + year,
        predictedPrice,
        predictedPricePerSqft: Math.round(predictedPrice / (properties[0]?.area || 1000)),
        appreciation: `+${((predictedPrice / currentAvgPrice - 1) * 100).toFixed(1)}%`
      });
    }

    res.status(200).json({
      success: true,
      prediction: {
        location: {
          city: city || 'All Cities',
          locality: locality || 'All Localities'
        },
        propertyType: propertyType || 'All Types',
        currentPrice: {
          average: currentAvgPrice,
          pricePerSqft: currentAvgPricePerSqft
        },
        expectedAppreciation: `${(rate * 100).toFixed(1)}% per year`,
        predictions,
        investmentAdvice: generateInvestmentAdvice(rate, years, currentAvgPrice, predictions[predictions.length - 1]?.predictedPrice)
      }
    });

  } catch (error) {
    console.error('Price prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating price prediction'
    });
  }
};

// Helper function for investment advice
function generateInvestmentAdvice(rate, years, currentPrice, futurePrice) {
  const totalAppreciation = ((futurePrice - currentPrice) / currentPrice) * 100;
  const advice = [];

  if (rate > 0.10) {
    advice.push('🚀 High growth market - Strong investment opportunity');
  } else if (rate > 0.07) {
    advice.push('📈 Steady growth market - Good for long-term investment');
  } else {
    advice.push('🐢 Slow growth market - Consider for self-use rather than investment');
  }

  if (totalAppreciation > 50) {
    advice.push(`💰 Expected to grow ${totalAppreciation.toFixed(0)}% in ${years} years`);
  }

  if (years >= 5 && rate > 0.08) {
    advice.push('⏰ Long-term holding recommended for maximum returns');
  }

  return advice;
}

// @desc    AI Property Comparison
// @route   POST /api/ai/compare
// @access  Public
export const compareProperties = async (req, res) => {
  try {
    const { propertyIds } = req.body;

    if (!propertyIds || propertyIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 property IDs to compare'
      });
    }

    if (propertyIds.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 properties can be compared at once'
      });
    }

    const properties = await Property.find({
      _id: { $in: propertyIds }
    });

    if (properties.length !== propertyIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more properties not found'
      });
    }

    // Calculate comparison metrics
    const comparison = properties.map((p, idx) => {
      const pricePerSqft = p.pricePerSqft || Math.round(p.price / p.area);
      
      // Value score (lower price per sqft = better value)
      const avgPrice = properties.reduce((sum, prop) => sum + prop.pricePerSqft, 0) / properties.length;
      const valueScore = Math.round((avgPrice / pricePerSqft) * 50);

      // Location score (based on amenities count as proxy)
      const locationScore = Math.min(50 + (p.amenities?.length || 0) * 5, 100);

      // Condition score (based on age)
      const conditionScore = Math.max(100 - (p.age || 0) * 5, 50);

      // Overall score
      const overallScore = Math.round((valueScore + locationScore + conditionScore) / 3);

      return {
        property: {
          id: p._id,
          title: p.title,
          price: p.price,
          area: p.area,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          propertyType: p.propertyType,
          status: p.status,
          furnishing: p.furnishing,
          age: p.age,
          location: `${p.location.locality}, ${p.location.city}`,
          amenities: p.amenities,
          images: p.images
        },
        metrics: {
          pricePerSqft,
          valueScore,
          locationScore,
          conditionScore,
          overallScore
        },
        pros: generatePros(p, pricePerSqft, avgPrice),
        cons: generateCons(p, pricePerSqft, avgPrice)
      };
    });

    // Find best options
    const bestValue = comparison.reduce((best, curr) => 
      curr.metrics.valueScore > best.metrics.valueScore ? curr : best
    );
    const bestLocation = comparison.reduce((best, curr) => 
      curr.metrics.locationScore > best.metrics.locationScore ? curr : best
    );
    const bestOverall = comparison.reduce((best, curr) => 
      curr.metrics.overallScore > best.metrics.overallScore ? curr : best
    );

    res.status(200).json({
      success: true,
      comparison,
      summary: {
        bestValue: {
          property: bestValue.property.title,
          score: bestValue.metrics.valueScore
        },
        bestLocation: {
          property: bestLocation.property.title,
          score: bestLocation.metrics.locationScore
        },
        bestOverall: {
          property: bestOverall.property.title,
          score: bestOverall.metrics.overallScore
        }
      },
      recommendation: generateComparisonRecommendation(comparison)
    });

  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing properties'
    });
  }
};

// Helper functions for comparison
function generatePros(property, pricePerSqft, avgPrice) {
  const pros = [];

  if (pricePerSqft < avgPrice) {
    pros.push('💰 Better value than average');
  }
  if (property.age < 3) {
    pros.push('🆕 New construction');
  }
  if (property.furnishing === 'Furnished') {
    pros.push('🪑 Move-in ready');
  }
  if (property.status === 'Ready to Move') {
    pros.push('🏠 Immediately available');
  }
  if (property.amenities?.length > 8) {
    pros.push('🎯 Premium amenities');
  }
  if (property.bedrooms >= 3) {
    pros.push('👨‍👩‍👧‍👦 Spacious');
  }

  return pros;
}

function generateCons(property, pricePerSqft, avgPrice) {
  const cons = [];

  if (pricePerSqft > avgPrice * 1.1) {
    cons.push('💸 Premium pricing');
  }
  if (property.age > 10) {
    cons.push('🔧 Older property');
  }
  if (property.furnishing === 'Unfurnished') {
    cons.push('🪑 Additional furnishing cost');
  }
  if (property.status === 'Under Construction') {
    cons.push('⏳ Wait for possession');
  }
  if (property.amenities?.length < 5) {
    cons.push('🎯 Limited amenities');
  }

  return cons;
}

function generateComparisonRecommendation(comparison) {
  const best = comparison.reduce((a, b) => 
    a.metrics.overallScore > b.metrics.overallScore ? a : b
  );

  return `Based on our AI analysis, "${best.property.title}" offers the best overall value with a score of ${best.metrics.overallScore}/100. It balances price, location, and condition effectively.`;
}
