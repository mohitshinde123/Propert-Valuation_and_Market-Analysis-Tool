import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProperties } from '../context/PropertyContext';
import { generateComparisonReport } from '../utils/pdfGenerator';
import { formatPrice, formatArea, getStatusColor } from '../utils/format';
import toast from 'react-hot-toast';
import {
  Search, X, CheckCircle, Bed, Bath, Maximize, MapPin, Building2,
  Download, ArrowRight, TrendingUp, Shield, Clock
} from 'lucide-react';

export function Compare() {
  const { properties, calculateValuation } = useProperties();
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const approvedProperties = properties.filter(p => p.isApproved);
  const filteredProperties = approvedProperties.filter(p => 
    !selectedProperties.find(s => s.id === p.id) && (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).slice(0, 10);

  const addProperty = (property) => {
    if (selectedProperties.length < 3) {
      setSelectedProperties([...selectedProperties, property]);
      setSearchQuery('');
      setShowSearch(false);
    } else {
      toast.error('You can compare up to 3 properties');
    }
  };

  const removeProperty = (id) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== id));
  };

  const handleDownloadReport = () => {
    if (selectedProperties.length >= 2) {
      generateComparisonReport(selectedProperties);
      toast.success('Comparison report downloaded');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Compare Properties</h1>
            <p className="mt-2 text-blue-100">Compare up to 3 properties side by side</p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Property Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Selected Properties ({selectedProperties.length}/3)</h2>
            {selectedProperties.length >= 2 && (
              <button onClick={handleDownloadReport} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <Download className="h-4 w-4" /> Download Report
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {selectedProperties.map((property) => (
              <motion.div key={property.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-xl bg-white p-4 shadow-lg">
                <button onClick={() => removeProperty(property.id)} className="absolute right-2 top-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200">
                  <X className="h-4 w-4" />
                </button>
                <img src={property.images[0]} alt="" className="h-32 w-full rounded-lg object-cover" />
                <h3 className="mt-3 font-medium text-gray-900">{property.title}</h3>
                <p className="text-sm text-gray-500">{property.location.locality}, {property.location.city}</p>
                <p className="mt-1 font-semibold text-blue-600">{formatPrice(property.price)}</p>
              </motion.div>
            ))}

            {selectedProperties.length < 3 && (
              <button onClick={() => setShowSearch(true)} className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-500 hover:border-blue-500 hover:text-blue-600">
                <Search className="h-8 w-8" />
                <span className="mt-2 font-medium">Add Property</span>
              </button>
            )}
          </div>

          {/* Search Modal */}
          {showSearch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Search Property</h3>
                  <button onClick={() => setShowSearch(false)} className="rounded-full p-1 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or city..."
                    autoFocus
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
                  {filteredProperties.map((property) => (
                    <button
                      key={property.id}
                      onClick={() => addProperty(property)}
                      className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:border-blue-500 hover:bg-blue-50"
                    >
                      <img src={property.images[0]} alt="" className="h-12 w-16 rounded object-cover" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{property.title}</h4>
                        <p className="text-xs text-gray-500">{property.location.city}</p>
                        <p className="text-sm font-semibold text-blue-600">{formatPrice(property.price)}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedProperties.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    {selectedProperties.map((p, idx) => (
                      <th key={p.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Property {idx + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* Price */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Price</td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-blue-600">{formatPrice(p.price)}</span>
                        <div className="text-xs text-gray-500">₹{p.pricePerSqft.toLocaleString()}/sq.ft</div>
                      </td>
                    ))}
                  </tr>

                  {/* AI Valuation */}
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        AI Valuation
                      </div>
                    </td>
                    {selectedProperties.map((p) => {
                      const val = calculateValuation(p);
                      return (
                        <td key={p.id} className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-green-600">{formatPrice(val.estimatedValue)}</span>
                          <div className="text-xs text-gray-500">{val.confidenceScore}% confidence</div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Area */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Maximize className="h-4 w-4 text-gray-400" />
                        Area
                      </div>
                    </td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center font-semibold">{formatArea(p.area)}</td>
                    ))}
                  </tr>

                  {/* Bedrooms */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-gray-400" />
                        Bedrooms
                      </div>
                    </td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center font-semibold">{p.bedrooms} BHK</td>
                    ))}
                  </tr>

                  {/* Bathrooms */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Bath className="h-4 w-4 text-gray-400" />
                        Bathrooms
                      </div>
                    </td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center font-semibold">{p.bathrooms}</td>
                    ))}
                  </tr>

                  {/* Location */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        Location
                      </div>
                    </td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center text-sm">{p.location.locality}, {p.location.city}</td>
                    ))}
                  </tr>

                  {/* Status */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Status</td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(p.status)}`}>{p.status}</span>
                      </td>
                    ))}
                  </tr>

                  {/* Furnishing */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        Furnishing
                      </div>
                    </td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center text-sm">{p.furnishing}</td>
                    ))}
                  </tr>

                  {/* Age */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        Property Age
                      </div>
                    </td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center text-sm">{p.age === 0 ? 'New' : `${p.age} years`}</td>
                    ))}
                  </tr>

                  {/* Verified */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Verified</td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center">
                        {p.isVerified ? (
                          <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-red-500" />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Amenities Count */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Amenities</td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center font-semibold">{p.amenities.length} amenities</td>
                    ))}
                  </tr>

                  {/* Action */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">View Details</td>
                    {selectedProperties.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center">
                        <Link to={`/property/${p.id}`} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                          View <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {selectedProperties.length < 2 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-lg">
            <Building2 className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Add Properties to Compare</h3>
            <p className="mt-2 text-gray-500">Select at least 2 properties to start comparing</p>
            <button onClick={() => setShowSearch(true)} className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Add Property
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
