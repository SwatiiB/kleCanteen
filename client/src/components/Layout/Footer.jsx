import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-primary-900 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer top section with logo and tagline */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <h2 className="text-3xl font-bold">
              <span className="text-white">KLE</span>
              <span className="text-accent-300 ml-1">Canteen</span>
            </h2>
          </Link>
          <p className="text-primary-100 mt-2 max-w-md mx-auto">
            Delicious food, delivered fast. Connecting students and faculty with campus dining.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-primary-700 pb-2">About Us</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              KLE Canteen streamlines food ordering at KLETECH campus with a modern, efficient solution.
              Skip the lines and enjoy your favorite meals from KLE campus canteens.
              Fast, convenient, and delicious!
            </p>
            <div className="mt-4 flex space-x-3">
              <a href="#" className="p-2 bg-primary-700 rounded-full text-white hover:bg-primary-600 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-primary-700 rounded-full text-white hover:bg-primary-600 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-primary-700 rounded-full text-white hover:bg-primary-600 transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-primary-700 pb-2">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li>
                <Link to="/" className="text-primary-100 hover:text-white transition-colors flex items-center">
                  <span className="bg-primary-700 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/canteens" className="text-primary-100 hover:text-white transition-colors flex items-center">
                  <span className="bg-primary-700 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Canteens
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-primary-100 hover:text-white transition-colors flex items-center">
                  <span className="bg-primary-700 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-primary-100 hover:text-white transition-colors flex items-center">
                  <span className="bg-primary-700 h-1.5 w-1.5 rounded-full mr-2"></span>
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-primary-100 hover:text-white transition-colors flex items-center">
                  <span className="bg-primary-700 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-primary-100 hover:text-white transition-colors flex items-center">
                  <span className="bg-primary-700 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Feedback
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-100 hover:text-white transition-colors flex items-center">
                  <span className="bg-primary-700 h-1.5 w-1.5 rounded-full mr-2"></span>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-100 hover:text-white transition-colors flex items-center">
                  <span className="bg-primary-700 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-primary-700 pb-2">Contact Us</h3>
            <address className="text-primary-100 text-sm not-italic space-y-3">
              <div className="flex items-start">
                <MapPin size={18} className="mr-2 mt-0.5 text-accent-300 flex-shrink-0" />
                <div>
                  <p>KLE Technological University</p>
                  <p>Vidyanagar, Hubballi - 580031</p>
                  <p>Karnataka, India</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="mr-2 text-accent-300 flex-shrink-0" />
                <p>support@klecanteen.com</p>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-2 text-accent-300 flex-shrink-0" />
                <p>+91 1234567890</p>
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-2 text-accent-300 flex-shrink-0" />
                <p>Mon-Sat: 8:00 AM - 8:00 PM</p>
              </div>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-primary-700 text-center text-sm text-primary-200">
          <p>© {currentYear} KLE Canteen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
