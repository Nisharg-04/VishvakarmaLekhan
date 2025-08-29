import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  FileText,
  History,
  Home,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/navbar.css";

const Navbar: React.FC<{ onAuthRequired: () => void }> = ({
  onAuthRequired,
}) => {
  const { isDark, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/features", label: "Features", icon: Sparkles },
    { path: "/generate", label: "Generate Report", icon: FileText },
    { path: "/history", label: "History", icon: History },
    { path: "/support", label: "Support", icon: HelpCircle },
  ];
  if (user?.role === "admin")
    navItems.push({ path: "/admin", label: "Admin", icon: Shield });

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/VLlogo.PNG"
            alt="Logo"
            className="w-12 h-12 object-contain rounded-full"
          />
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vishvakarma Lekhan
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Think Less, Report More
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-3">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => {
                if (path === "/" || isAuthenticated) {
                  navigate(path);
                } else {
                  onAuthRequired();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive(path)
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-slate-600" />
            )}
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <User size={16} />
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name}
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="profile-dropdown"
                  >
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                      className="profile-dropdown-item"
                    >
                      <Settings size={16} /> Profile Settings
                    </button>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => {
                          navigate("/admin");
                          setShowUserMenu(false);
                        }}
                        className="profile-dropdown-item"
                      >
                        <Shield size={16} /> Admin Panel
                      </button>
                    )}
                    <hr className="profile-dropdown-divider" />
                    <button
                      onClick={handleLogout}
                      className="profile-dropdown-item profile-dropdown-logout"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={onAuthRequired} className="sign-in-button">
              Sign In
            </button>
          )}

          {/* Mobile Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
          >
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (path === "/" || isAuthenticated) {
                    navigate(path);
                  } else {
                    onAuthRequired();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left text-sm ${
                  isActive(path)
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
            {isAuthenticated && (
              <div className="border-t border-slate-200 dark:border-slate-700 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
