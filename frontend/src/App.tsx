import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { AdminDashboard } from "./components/AdminDashboard";
import LekhakAI from "./components/LekhakAI";
import Home from "./pages/Home";
import GenerateReport from "./pages/GenerateReport";
import ReportHistory from "./pages/ReportHistory";
import EnhancedProfile from "./pages/EnhancedProfile";
import Features from "./pages/Features";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Support from "./pages/Support";
import ContactUs from "./pages/ContactUs";
import RequestFeature from "./pages/RequestFeature";
import NotFound from "./pages/NotFound";

function App() {
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className={isDark ? "dark" : ""}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Navbar onAuthRequired={() => setShowAuthModal(true)} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/request-feature" element={<RequestFeature />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route
              path="/generate"
              element={user ? <GenerateReport /> : <Home />}
            />
            <Route
              path="/history"
              element={user ? <ReportHistory /> : <Home />}
            />
            <Route
              path="/profile"
              element={user ? <EnhancedProfile /> : <Home />}
            />
            {user?.role === "admin" && (
              <Route path="/admin" element={<AdminDashboard />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />

          {/* LekhakAI Chatbot - only show for authenticated users */}
          {user && <LekhakAI />}

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: isDark ? "#374151" : "#ffffff",
                color: isDark ? "#ffffff" : "#000000",
                border: isDark ? "1px solid #4b5563" : "1px solid #e5e7eb",
              },
            }}
          />
        </div>
      </Router>
    </div>
  );
}

export default App;
