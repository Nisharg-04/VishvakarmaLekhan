import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Heart,
  Sparkles,
  HelpCircle,
  Shield,
  MessageSquare,
  Lightbulb,
  Home,
  Users,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/team", label: "Our Team", icon: Users },
    { path: "/features", label: "Features", icon: Sparkles },
    { path: "/support", label: "Support", icon: HelpCircle },
    { path: "/contact", label: "Contact Us", icon: MessageSquare },
    { path: "/request-feature", label: "Request Feature", icon: Lightbulb },
    { path: "/privacy", label: "Privacy Policy", icon: Shield },
  ];

  const socialLinks = [
    { href: "#", icon: Facebook, label: "Facebook" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
    { href: "#", icon: Linkedin, label: "LinkedIn" },
    { href: "#", icon: Github, label: "GitHub" },
  ];

  const institutions = [
    { name: "BVM Engineering College", logo: "/BVM Logo-1.png" },
    { name: "CVM University", logo: "/CVM Logo.png" },
    { name: "Vishvakarma Lekhan", logo: "/VLlogo.PNG" },
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <img
                src="/VLlogo.PNG"
                alt="Vishvakarma Lekhan"
                className="w-12 h-12 object-contain rounded-full"
              />
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Vishvakarma Lekhan
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Think Less, Report More
                </p>
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              AI-powered report generation platform designed for academic and
              professional excellence.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-slate-500 mt-1 mr-2 flex-shrink-0" />
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  BVM Engineering College
                  <br />
                  V.V. Nagar, Anand, Gujarat 388120
                </p>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-slate-500 mr-2" />
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  +91 1234 567890
                </p>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-slate-500 mr-2" />
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  support@bvm-reports.edu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6">
            <div className="text-center">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Stay Updated
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                Get the latest updates about new features and improvements.
              </p>
              <div className="flex max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-r-lg font-medium hover:opacity-90 transition-opacity duration-300"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
              <span>© {currentYear} Vishvakarma Lekhan. Made with</span>
              <Heart className="w-4 h-4 text-red-500 mx-1" />
              <span>for academic excellence.</span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/team"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-300"
              >
                Our Team
              </Link>

              <Link
                to="/privacy"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/support"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                to="/contact"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-300"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
