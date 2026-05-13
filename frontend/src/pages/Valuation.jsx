import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProperties } from '../context/PropertyContext';
import { EMICalculator } from '../components/EMICalculator';
import { generateValuationReport } from '../utils/pdfGenerator';
import { formatPrice, formatArea } from '../utils/format';
import toast from 'react-hot-toast';
import {
  Calculator, TrendingUp, MapPin, Building2, Bed, Bath, Maximize,
  Download, ArrowRight, CheckCircle, Search
} from 'lucide-react';

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Independent House'];

export function Valuation() {
  const { properties, calculateValuation } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [valuation, setValuation] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualData, setManualData] = useState({
    city: '',
    locality: '',
    area: 1000,
    propertyType: 'Apartment',
    bedrooms: 2,
    age: 0,
    furnishing: 'Semi-Furnished'
  });

  // Safe filtering with null checks
  const filteredProperties = properties.filter(p => {
    if (!p.isApproved) return false;
    const query = searchQuery.toLowerCase();
    const title = (p.title || '').toLowerCase();
    const city = (p.location?.city || '').toLowerCase();
    const locality = (p.location?.locality || '').toLowerCase();
    return title.includes(query) || city.includes(query) || locality.includes(query);
  }).slice(0, 10);

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    // calculateValuation is now synchronous
    const val = calculateValuation(property);
    setValuation(val);
    setSearchQuery('');
  };

  const handleManualValuation = () => {
    // Simulate manual valuation calculation
    const basePricePerSqft = 5000 + (cities.indexOf(manualData.city) * 500);
    const estimatedValue = manualData.area * basePricePerSqft;
    
    setValuation({
      propertyId: 'MANUAL',
      estimatedValue: Math.round(estimatedValue / 100000) * 100000,
      confidenceScore: 72,
      marketTrend: 'Stable',
      comparables: [],
      pricePerSqftAnalysis: {
        locality: basePricePerSqft,
        city: basePricePerSqft,
        difference: 0
      },
      recommendations: [
        `Based on ${manualData.city} market trends`,
        `${manualData.propertyType} properties are in high demand`,
        'Consider professional valuation for legal purposes'
      ],
      generatedAt: new Date().toISOString()
    });
    
    setSelectedProperty({
      id: 'MANUAL',
      title: `${manualData.bedrooms} BHK ${manualData.propertyType} in ${manualData.locality || manualData.city}`,
      location: { locality: manualData.locality || 'Central', city: manualData.city, address: '', state: '', pincode: '' },
      price: estimatedValue,
      pricePerSqft: basePricePerSqft,
      area: manualData.area,
      bedrooms: manualData.bedrooms,
      bathrooms: manualData.bedrooms - 1 > 0 ? manualData.bedrooms - 1 : 1,
      propertyType: manualData.propertyType,
      status: 'Ready to Move',
      furnishing: manualData.furnishing,
      age: manualData.age,
      floor: '5',
      totalFloors: 10,
      facing: 'East',
      amenities: ['Parking', 'Security', 'Lift'],
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop']
    });
  };

  const handleDownloadReport = () => {
    if (selectedProperty && valuation) {
      try {
        generateValuationReport(selectedProperty, valuation);
        toast.success('Report downloaded successfully');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download report');
      }
    } else {
      toast.error('Please select a property first');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <Calculator className="h-10 w-10 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white md:text-4xl">Property Valuation</h1>
                <p className="mt-1 text-blue-100">AI-powered property value estimation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Input Section */}
          <div className="lg:col-span-2">
            {/* Mode Toggle */}
            <div className="mb-6 flex gap-4">
              <button onClick={() => setManualMode(false)} className={`flex-1 rounded-lg py-3 font-medium transition-colors ${!manualMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
                <Search className="mr-2 inline h-4 w-4" /> Search Property
              </button>
              <button onClick={() => setManualMode(true)} className={`flex-1 rounded-lg py-3 font-medium transition-colors ${manualMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
                <Calculator className="mr-2 inline h-4 w-4" /> Manual Entry
              </button>
            </div>

            {!manualMode ? (
              /* Search Mode */
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Search for a Property</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by property name, city, or locality..."
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {searchQuery && (
                  <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
                    {filteredProperties.map((property) => (
                      <button
                        key={property.id}
                        onClick={() => handleSelectProperty(property)}
                        className="w-full flex items-center gap-4 rounded-lg border p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <img src={property.images[0]} alt="" className="h-16 w-24 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{property.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {property.location.locality}, {property.location.city}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm">
                            <span className="font-semibold text-blue-600">{formatPrice(property.price)}</span>
                            <span>{formatArea(property.area)}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Manual Entry Mode */
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Enter Property Details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                    <select value={manualData.city} onChange={(e) => setManualData({ ...manualData, city: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="">Select City</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Locality</label>
                    <input type="text" value={manualData.locality} onChange={(e) => setManualData({ ...manualData, locality: e.target.value })} placeholder="Enter locality" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Area (sq.ft)</label>
                    <input type="number" value={manualData.area} onChange={(e) => setManualData({ ...manualData, area: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Property Type</label>
                    <select value={manualData.propertyType} onChange={(e) => setManualData({ ...manualData, propertyType: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                      {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Bedrooms</label>
                    <select value={manualData.bedrooms} onChange={(e) => setManualData({ ...manualData, bedrooms: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Property Age (years)</label>
                    <input type="number" value={manualData.age} onChange={(e) => setManualData({ ...manualData, age: Number(e.target.value) })} min="0" max="50" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <button onClick={handleManualValuation} disabled={!manualData.city} className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  Calculate Valuation
                </button>
              </div>
            )}

            {/* Valuation Results */}
            {valuation && selectedProperty && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Valuation Result</h2>
                  <button onClick={handleDownloadReport} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    <Download className="h-4 w-4" /> Download Report
                  </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-sm opacity-80">Estimated Value</span>
                    </div>
                    <div className="mt-2 text-4xl font-bold">{formatPrice(valuation.estimatedValue)}</div>
                    <div className="mt-2 text-sm opacity-80">
                      Confidence: {valuation.confidenceScore}% • Market: {valuation.marketTrend}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-6">
                    <h3 className="font-semibold text-gray-900">Property Summary</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{selectedProperty.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedProperty.location.locality}, {selectedProperty.location.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize className="h-4 w-4 text-gray-400" />
                        <span>{formatArea(selectedProperty.area)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Analysis */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900">Price Analysis</h3>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-500">Locality Avg</div>
                      <div className="font-semibold">₹{valuation.pricePerSqftAnalysis.locality.toLocaleString()}/sq.ft</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">City Avg</div>
                      <div className="font-semibold">₹{valuation.pricePerSqftAnalysis.city.toLocaleString()}/sq.ft</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Difference</div>
                      <div className={`font-semibold ${valuation.pricePerSqftAnalysis.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {valuation.pricePerSqftAnalysis.difference > 0 ? '+' : ''}{valuation.pricePerSqftAnalysis.difference}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
                  <ul className="mt-3 space-y-2">
                    {valuation.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - EMI Calculator */}
          <div>
            <EMICalculator propertyPrice={selectedProperty?.price || 5000000} />
          </div>
        </div>
      </div>
    </div>
  );
}
