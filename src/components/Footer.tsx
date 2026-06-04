import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f0500] text-amber-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500">
                <img src="/images/logo.png" alt="MRM Shopping" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-lg font-bold text-amber-400 block">MRM Shopping</span>
                <span className="text-xs text-amber-200/50">Dubai Chocolate & More</span>
              </div>
            </div>
            <p className="text-sm text-amber-200/60 leading-relaxed">
              Premium Dubai chocolates delivered to your doorstep across Sri Lanka. Authentic taste, luxury experience.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://wa.me/94707070872" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors">
                <MessageCircle size={14} />
              </a>
              <a href="#" className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors text-xs font-bold">
                IG
              </a>
              <a href="#" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors text-xs font-bold">
                FB
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-amber-400 font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Products' },
                { to: '/tracking', label: 'Track Order' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/account', label: 'My Account' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-amber-200/60 hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery Info */}
          <div>
            <h3 className="text-amber-400 font-semibold mb-4 text-sm uppercase tracking-wider">🚚 Delivery Charges</h3>
            <ul className="space-y-2 text-sm text-amber-200/60">
              <li>Up to 0.25kg → <span className="text-amber-400 font-medium">Rs. 150</span></li>
              <li>Up to 0.5kg → <span className="text-amber-400 font-medium">Rs. 250</span></li>
              <li>Up to 0.75kg → <span className="text-amber-400 font-medium">Rs. 350</span></li>
              <li>Up to 1kg → <span className="text-amber-400 font-medium">Rs. 450</span></li>
            </ul>
            <p className="text-xs text-amber-200/40 mt-3">* Delivery charge calculated based on total order weight</p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-amber-400 font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3 text-sm text-amber-200/60">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-amber-500 flex-shrink-0" />
                <a href="tel:0707070872" className="hover:text-amber-400 transition-colors">0707070872</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-amber-500 flex-shrink-0" />
                <a href="mailto:mrmshopping2025@gmail.com" className="hover:text-amber-400 transition-colors text-xs">mrmshopping2025@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Anuradhapura, Sri Lanka</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-800/30">
              <p className="text-xs text-amber-300 font-medium">Business Hours</p>
              <p className="text-xs text-amber-200/50 mt-1">Mon - Sat: 9:00 AM - 8:00 PM</p>
              <p className="text-xs text-amber-200/50">Sun: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-900/30 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-amber-200/40">© 2025 MRM Shopping. All rights reserved.</p>
          <p className="text-xs text-amber-200/40">Crafted with ❤️ for chocolate lovers in Sri Lanka</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
