import { motion } from 'framer-motion';
import { marketAnalytics } from '../data/properties';
import { formatPrice } from '../utils/format';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Building2, IndianRupee, MapPin, Activity } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function MarketAnalysis() {
  const { totalListings, activeListings, avgPrice, avgPricePerSqft, topLocalities, propertyTypeDistribution, priceTrends } = marketAnalytics;

  const stats = [
    { label: 'Total Listings', value: totalListings.toLocaleString(), icon: Building2, color: 'bg-blue-500' },
    { label: 'Active Listings', value: activeListings.toLocaleString(), icon: Activity, color: 'bg-green-500' },
    { label: 'Avg. Price', value: formatPrice(avgPrice), icon: IndianRupee, color: 'bg-amber-500' },
    { label: 'Avg. Price/sq.ft', value: `₹${avgPricePerSqft.toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Market Analysis</h1>
            <p className="mt-2 text-blue-100">Comprehensive real estate market insights and trends across India</p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Price Trends Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Price Trends</h2>
                <p className="text-sm text-gray-500">Average property prices over the year</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                <TrendingUp className="h-4 w-4" /> +11% YoY
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [formatPrice(value), 'Avg. Price']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="avgPrice" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Property Type Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Property Type Distribution</h2>
              <p className="text-sm text-gray-500">Breakdown by property category</p>
            </div>
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie data={propertyTypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="count">
                    {propertyTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Properties']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {propertyTypeDistribution.map((item, index) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm text-gray-600">{item.type}</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Top Localities */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl bg-white p-6 shadow-lg lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Localities by Listings</h2>
              <p className="text-sm text-gray-500">Most active areas with average prices</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topLocalities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis type="category" dataKey="name" stroke="#6B7280" width={150} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name) => [name === 'listings' ? value : formatPrice(value), name === 'listings' ? 'Listings' : 'Avg. Price']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="listings" fill="#3B82F6" name="Listings" radius={[0, 4, 4, 0]} />
                <Bar dataKey="avgPrice" fill="#10B981" name="Avg. Price" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Market Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <h2 className="mb-6 text-2xl font-bold">Market Insights</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-300" />
                <span className="font-semibold">Rising Markets</span>
              </div>
              <p className="text-sm text-blue-100">Bangalore and Hyderabad continue to show strong growth with IT sector expansion driving demand.</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-300" />
                <span className="font-semibold">Hot Localities</span>
              </div>
              <p className="text-sm text-blue-100">Whitefield, Gachibowli, and Gurgaon are the most searched areas with premium appreciation.</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-300" />
                <span className="font-semibold">Buyer's Market</span>
              </div>
              <p className="text-sm text-blue-100">Kolkata and Chennai offer better value with prices stabilizing and inventory increasing.</p>
            </div>
          </div>
        </motion.div>

        {/* Investment Tips */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Best for Investment', city: 'Bangalore', reason: 'IT Hub Growth', change: '+15%' },
            { title: 'Most Affordable', city: 'Kolkata', reason: 'Value for Money', change: '+5%' },
            { title: 'Premium Market', city: 'Mumbai', reason: 'High Appreciation', change: '+12%' },
            { title: 'Emerging Market', city: 'Hyderabad', reason: 'Infrastructure Growth', change: '+18%' }
          ].map((tip, index) => (
            <motion.div key={tip.city} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="rounded-xl bg-white p-6 shadow-lg">
              <p className="text-sm text-gray-500">{tip.title}</p>
              <h3 className="mt-1 text-xl font-bold text-gray-900">{tip.city}</h3>
              <p className="mt-1 text-sm text-gray-600">{tip.reason}</p>
              <div className="mt-3 flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">{tip.change}</span>
                <span className="text-sm text-gray-500">YoY</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
