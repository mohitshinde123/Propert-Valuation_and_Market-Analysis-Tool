import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">
                Indian<span className="text-blue-500">RealEstate</span>
              </span>
            </div>
            <p className="mb-4 text-sm">
              India's leading property valuation and market analysis platform. Making real estate decisions easier with AI-powered insights.
            </p>
            <div className="flex space-x-4">
              {['f', 'X', 'in', 'IG'].map((icon, i) => (
                <span key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer text-xs font-bold">
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/properties" className="hover:text-white transition-colors">Buy Property</Link></li>
              <li><Link to="/seller/dashboard" className="hover:text-white transition-colors">Sell Property</Link></li>
              <li><Link to="/market-analysis" className="hover:text-white transition-colors">Market Analysis</Link></li>
              <li><Link to="/valuation" className="hover:text-white transition-colors">Property Valuation</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Compare Properties</Link></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Property Types</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/properties?type=Apartment" className="hover:text-white transition-colors">Apartments</Link></li>
              <li><Link to="/properties?type=Villa" className="hover:text-white transition-colors">Villas</Link></li>
              <li><Link to="/properties?type=Plot" className="hover:text-white transition-colors">Plots</Link></li>
              <li><Link to="/properties?type=Independent House" className="hover:text-white transition-colors">Independent Houses</Link></li>
              <li><Link to="/properties?type=Commercial" className="hover:text-white transition-colors">Commercial Properties</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                <span>123 Business Park, Andheri East, Mumbai - 400069</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <span>+91 1800-123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <span>support@indianrealestate.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Indian Real Estate. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
