import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PropertyCard } from '../components/PropertyCard';
import { SearchFilters } from '../components/SearchFilters';
import { useProperties } from '../context/PropertyContext';
import { Loader2, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

export function Properties() {
  const [searchParams] = useSearchParams();
  const { getProperties, loading } = useProperties();
  
  const [filters, setFilters] = useState({
    searchQuery: searchParams.get('search') || '',
    city: searchParams.get('city') || undefined,
    propertyType: searchParams.get('type') || undefined,
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    status: undefined,
    furnishing: undefined,
    sortBy: 'newest'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, totalPages: 0 });

  useEffect(() => {
    const newFilters = {
      ...filters,
      searchQuery: searchParams.get('search') || filters.searchQuery,
      city: searchParams.get('city') || filters.city,
      propertyType: searchParams.get('type') || filters.propertyType
    };
    setFilters(newFilters);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const data = getProperties(currentPage, filters);
    setResult(data);
  }, [currentPage, filters, getProperties]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    const data = getProperties(1, filters);
    setResult(data);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Properties</h1>
          <p className="mt-2 text-gray-600">
            Discover {result.total.toLocaleString()} properties across India
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Filters */}
        <SearchFilters filters={filters} onFilterChange={handleFilterChange} onSearch={handleSearch} />

        {/* Results Count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{result.data.length}</span> of{' '}
            <span className="font-semibold">{result.total.toLocaleString()}</span> properties
          </p>
          <div className="text-sm text-gray-500">Page {currentPage} of {result.totalPages}</div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : result.data.length > 0 ? (
          <>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.data.map((property, index) => (
                <motion.div key={property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, result.totalPages) }, (_, i) => {
                    let pageNum;
                    if (result.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= result.totalPages - 2) {
                      pageNum = result.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === result.totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Building2 className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">No Properties Found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
