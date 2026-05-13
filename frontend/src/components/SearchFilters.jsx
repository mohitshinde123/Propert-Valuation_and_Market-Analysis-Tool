import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Independent House', 'Commercial'];
const statuses = ['Ready to Move', 'Under Construction', 'New Launch'];
const furnishingOptions = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const bedroomOptions = [1, 2, 3, 4, 5];

const priceRanges = [
  { label: 'Any', min: undefined, max: undefined },
  { label: 'Under 50 Lac', min: 0, max: 5000000 },
  { label: '50 Lac - 1 Cr', min: 5000000, max: 10000000 },
  { label: '1 Cr - 2 Cr', min: 10000000, max: 20000000 },
  { label: '2 Cr - 5 Cr', min: 20000000, max: 50000000 },
  { label: 'Above 5 Cr', min: 50000000, max: undefined }
];

export function SearchFilters({ filters, onFilterChange, onSearch }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleClearFilters = () => {
    onFilterChange({
      searchQuery: '',
      city: undefined,
      propertyType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      status: undefined,
      furnishing: undefined,
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = filters.city || filters.propertyType || filters.minPrice || 
    filters.maxPrice || filters.bedrooms || filters.status || filters.furnishing;

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      {/* Main Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location, property name..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={filters.city || ''}
          onChange={(e) => onFilterChange({ ...filters, city: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={filters.propertyType || ''}
          onChange={(e) => onFilterChange({ ...filters, propertyType: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Property Type</option>
          {propertyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSearch}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Search className="h-5 w-5" />
          Search
        </motion.button>
      </div>

      {/* Toggle Advanced Filters */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Price Range */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Price Range</label>
            <select
              value={priceRanges.findIndex(r => r.min === filters.minPrice && r.max === filters.maxPrice)}
              onChange={(e) => {
                const range = priceRanges[parseInt(e.target.value)];
                onFilterChange({ ...filters, minPrice: range.min, maxPrice: range.max });
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              {priceRanges.map((range, idx) => (
                <option key={idx} value={idx}>{range.label}</option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bedrooms</label>
            <div className="flex gap-2">
              {bedroomOptions.map(num => (
                <button
                  key={num}
                  onClick={() => onFilterChange({ ...filters, bedrooms: filters.bedrooms === num ? undefined : num })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    filters.bedrooms === num
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-blue-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Any Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Furnishing</label>
            <select
              value={filters.furnishing || ''}
              onChange={(e) => onFilterChange({ ...filters, furnishing: e.target.value || undefined })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Any</option>
              {furnishingOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area">Largest Area</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.city && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              {filters.city}
              <button onClick={() => onFilterChange({ ...filters, city: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.propertyType && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              {filters.propertyType}
              <button onClick={() => onFilterChange({ ...filters, propertyType: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.bedrooms && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              {filters.bedrooms} BHK
              <button onClick={() => onFilterChange({ ...filters, bedrooms: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              Price Filter
              <button onClick={() => onFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
