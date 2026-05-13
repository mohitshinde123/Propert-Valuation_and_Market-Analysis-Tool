import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../context/PropertyContext';
import {
  Search,
  TrendingUp,
  Shield,
  FileText,
  BarChart3,
  MapPin,
  Building2,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const stats = [
  { label: 'Properties Listed', value: '14,500+', icon: Building2 },
  { label: 'Happy Customers', value: '50,000+', icon: Users },
  { label: 'Cities Covered', value: '8+', icon: MapPin },
  { label: 'Verified Listings', value: '12,000+', icon: CheckCircle }
];

const features = [
  {
    icon: TrendingUp,
    title: 'AI-Powered Valuations',
    description: 'Get accurate property valuations using our advanced AI algorithms that analyze market trends and comparable properties.'
  },
  {
    icon: BarChart3,
    title: 'Market Analysis',
    description: 'Comprehensive market reports with price trends, locality insights, and investment recommendations.'
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    description: 'All properties are verified by our team to ensure authenticity and protect you from fraud.'
  },
  {
    icon: FileText,
    title: 'Download Reports',
    description: 'Generate and download detailed valuation reports in PDF format for your records.'
  }
];

const popularCities = [
  { name: 'Mumbai', properties: 2500, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop' },
  { name: 'Delhi', properties: 2200, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop' },
  { name: 'Bangalore', properties: 1800, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop' },
  { name: 'Hyderabad', properties: 1500, image: 'https://images.unsplash.com/photo-1665317340006-c5ef9bb34587?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Chennai', properties: 1200, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop' },
  { name: 'Pune', properties: 1100, image: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?w=400&h=300&fit=crop' }
];

export function Home() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  
  const featuredProperties = properties.filter(p => p.isFeatured && p.isApproved).slice(0, 6);
  const recentProperties = properties.filter(p => p.isApproved).slice(0, 6);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Find Your Dream Property in{' '}
              <span className="text-yellow-400">India</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
              AI-powered property valuations, market analysis, and comprehensive listings
              to help you make informed real estate decisions.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-2xl md:flex-row">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by city, locality, or property name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Search className="h-5 w-5" />
                  Search
                </motion.button>
              </div>

              {/* Quick Links */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-blue-100">
                <span>Popular:</span>
                {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'].map(city => (
                  <Link
                    key={city}
                    to={`/properties?city=${city}`}
                    className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 transition-colors"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900 md:text-3xl">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Featured Properties</h2>
              <p className="mt-1 text-gray-600">Hand-picked properties with verified details</p>
            </div>
            <Link to="/properties" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property, index) => (
              <motion.div key={property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Why Choose Indian RealEstate?</h2>
            <p className="mt-2 text-gray-600">Advanced tools and features to simplify your property journey</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Explore by City</h2>
            <p className="mt-2 text-gray-600">Find properties in India's top cities</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {popularCities.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/properties?city=${city.name}`} className="group relative block overflow-hidden rounded-xl">
                  <img src={city.image} alt={city.name} className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{city.name}</h3>
                    <p className="text-sm text-gray-200">{city.properties.toLocaleString()} Properties</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Ready to Find Your Perfect Property?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-blue-100">
            Join thousands of satisfied customers who found their dream homes through Indian RealEstate.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register" className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-gray-100">
              Get Started Free
            </Link>
            <Link to="/valuation" className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10">
              Try Valuation Tool
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
