import React from "react";
import { motion } from "framer-motion";
import {
  Bot,
  FileText,
  Download,
  Users,
  Calendar,
  Award,
  Shield,
  BarChart3,
  Sparkles,
  Clock,
  Globe,
  Settings,
  Archive,
  Search,
  Palette,
} from "lucide-react";

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Bot,
      title: "AI-Powered Report Generation",
      description: "Advanced LekhakAI generates professional reports from your event data automatically with intelligent content creation.",
      gradient: "from-blue-500 to-purple-600",
      features: [
        "Natural language processing",
        "Intelligent content structuring",
        "Context-aware writing",
        "Professional formatting"
      ]
    },
    {
      icon: FileText,
      title: "Professional Templates",
      description: "Choose from a variety of professionally designed templates tailored for academic and corporate events.",
      gradient: "from-green-500 to-teal-600",
      features: [
        "Academic report templates",
        "Corporate event formats",
        "Custom branding options",
        "Logo integration"
      ]
    },
    {
      icon: Download,
      title: "Multiple Export Formats",
      description: "Export your reports in various formats including DOCX, PDF, and HTML for maximum compatibility.",
      gradient: "from-orange-500 to-red-600",
      features: [
        "Microsoft Word (.docx)",
        "PDF documents",
        "HTML web format",
        "Print-ready layouts"
      ]
    },
    {
      icon: Users,
      title: "Collaboration Tools",
      description: "Work together with your team to create comprehensive reports with real-time collaboration features.",
      gradient: "from-purple-500 to-pink-600",
      features: [
        "Real-time editing",
        "Team permissions",
        "Comment system",
        "Version control"
      ]
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Organize and track all your events with integrated calendar and scheduling features.",
      gradient: "from-cyan-500 to-blue-600",
      features: [
        "Event scheduling",
        "Reminder notifications",
        "Calendar integration",
        "Timeline tracking"
      ]
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Ensure high-quality reports with built-in grammar checking and content validation.",
      gradient: "from-yellow-500 to-orange-600",
      features: [
        "Grammar checking",
        "Content validation",
        "Plagiarism detection",
        "Quality scoring"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Enterprise-grade security with end-to-end encryption and data protection."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track report performance and engagement with detailed analytics."
    },
    {
      icon: Clock,
      title: "Version History",
      description: "Access complete version history with rollback capabilities."
    },
    {
      icon: Globe,
      title: "Multi-language Support",
      description: "Generate reports in multiple languages with AI translation."
    },
    {
      icon: Settings,
      title: "Customization",
      description: "Fully customizable interface and report generation settings."
    },
    {
      icon: Archive,
      title: "Cloud Storage",
      description: "Secure cloud storage with automatic backup and sync."
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Advanced search functionality across all your reports and data."
    },
    {
      icon: Palette,
      title: "Theme Options",
      description: "Dark and light themes with customizable color schemes."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Powerful{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Features
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Discover the comprehensive suite of tools designed to make event report generation effortless, professional, and intelligent.
            </p>
          </motion.div>

          {/* Main Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-slate-600 dark:text-slate-300">
                      <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Additional Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Additional Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                  className="text-center p-6 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-20"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Experience These Features?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Start generating professional reports with AI-powered intelligence today.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all duration-300 shadow-lg"
              >
                Get Started Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;
