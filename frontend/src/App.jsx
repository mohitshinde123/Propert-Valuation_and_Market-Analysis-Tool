import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Properties } from './pages/Properties';
import { PropertyDetails } from './pages/PropertyDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MarketAnalysis } from './pages/MarketAnalysis';
import { Valuation } from './pages/Valuation';
import { Compare } from './pages/Compare';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import './index.css';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <PropertyProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/market-analysis" element={<MarketAnalysis />} />
                <Route path="/valuation" element={<Valuation />} />
                <Route path="/compare" element={<Compare />} />
                
                {/* Buyer Dashboard */}
                <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                <Route path="/buyer/saved" element={<BuyerDashboard />} />
                <Route path="/buyer/history" element={<BuyerDashboard />} />
                <Route path="/buyer/inquiries" element={<BuyerDashboard />} />
                
                {/* Seller Dashboard */}
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/seller/listings" element={<SellerDashboard />} />
                <Route path="/seller/inquiries" element={<SellerDashboard />} />
                <Route path="/seller/analytics" element={<SellerDashboard />} />
                
                {/* Admin Dashboard */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminDashboard />} />
                <Route path="/admin/properties" element={<AdminDashboard />} />
                <Route path="/admin/settings" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </PropertyProvider>
      </AuthProvider>
    </Router>
  );
}
