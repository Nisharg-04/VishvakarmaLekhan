import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  ArrowRight,
  Users,
  Bot,
  Sparkles,
  Star,
  Shield,
  BarChart3,
  MessageSquare,
  Rocket,
  PenTool,
  Edit3,
  Feather,
  Zap,
  GraduationCap,
} from "lucide-react";

const Home: React.FC = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const typingTexts = [
    "Professional Event Reports",
    "AI-Powered Documentation",
    
    "Smart Report Generation",
    "Intelligent Writing Assistant",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % typingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [typingTexts.length]);

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Intelligence",
      description:
        "Advanced Vishvakarma AI generates professional reports from your event data automatically",
      gradient: "from-blue-500 to-purple-600",
      delay: 0.1,
    },
    {
      icon: Sparkles,
      title: "Smart Content Generation",
      description:
        "Dynamic content blocks with AI suggestions for comprehensive event documentation",
      gradient: "from-purple-500 to-pink-600",
      delay: 0.2,
    },
    {
      icon: Download,
      title: "Professional Export",
      description:
        "Export beautifully formatted Word documents ready for academic submission",
      gradient: "from-emerald-500 to-teal-600",
      delay: 0.3,
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Track your report generation patterns and optimize your documentation workflow",
      gradient: "from-orange-500 to-red-600",
      delay: 0.4,
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with data protection and institutional compliance",
      gradient: "from-indigo-500 to-blue-600",
      delay: 0.5,
    },
    {
      icon: Rocket,
      title: "Lightning Fast",
      description:
        "Generate comprehensive reports in seconds, not hours of manual work",
      gradient: "from-yellow-500 to-orange-600",
      delay: 0.6,
    },
  ];

  const testimonials = [
    {
      name: "Dr. Vinay  J.  Patel",
      role: "Principal & HOD",
      college: "Birla Vishvakarma Mahavidyalaya",
      content:
        "Outstanding AI capabilities that understand academic requirements perfectly. Highly recommended for educational institutions.",
      avatar: "/VINAY_SIR.jpg",
      rating: 5,
    },
    {
      name: "Dr. Darshak  G.  Thakore",
      role: "HOD, Computer Engineering",
      college: "Birla Vishvakarma Mahavidyalaya",
      content:
        "Vishvakarma Lekhan has revolutionized how we document our academic events. The AI-powered reports are professional and save us hours of work.",
      avatar: "/DGT_SIR.jpg",
      rating: 5,
    },
    {
      name: "MAYURKUMAR M SEVAK",
      role: "Assistant Professor",
      college: "Birla Vishvakarma Mahavidyalaya",
      content:
        "The platform's ease of use and professional output quality has made our event documentation process incredibly efficient.",
      avatar: "/MAYUR_SIR.jpg",
      rating: 5,
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Input Event Details",
      description:
        "Enter comprehensive event information using our intuitive form interface",
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
    },
    {
      step: "02",
      title: "AI Processing",
      description:
        "Our advanced AI analyzes and structures your data intelligently",
      icon: Bot,
      color: "from-purple-500 to-pink-600",
    },
    {
      step: "03",
      title: "Generate & Export",
      description: "Download your professional Word document instantly",
      icon: Download,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden pt-15">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-[800px] h-[800px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-10 relative z-10"
              >
                {/* Institution Logos */}
                {/* <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src="/BVM Logo-1.png"
                      alt="BVM Logo"
                      className="h-10 w-auto object-contain bg-white/90 dark:bg-white rounded-lg p-2 shadow-lg"
                    />
                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
                    <img
                      src="/CVM Logo.png"
                      alt="CVM Logo"
                      className="h-10 w-auto object-contain bg-white/90 dark:bg-white rounded-lg p-2 shadow-lg"
                    />
                  </div>
                </motion.div> */}

                {/* Main Title with Writing Effect */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative"
                  >
                    <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent block relative">
                        Vishvakarma
                        {/* Writing underline effect */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            delay: 1.2,
                            duration: 1.5,
                            ease: "easeInOut",
                          }}
                          className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-orange-400 to-red-500 origin-left rounded-full"
                          style={{ width: "100%" }}
                        />
                      </span>
                      <span className="text-slate-800 dark:text-white block mt-2 relative">
                        Lekhan
                        {/* Writing underline effect */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            delay: 1.8,
                            duration: 1.5,
                            ease: "easeInOut",
                          }}
                          className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 origin-left rounded-full"
                          style={{ width: "70%" }}
                        />
                      </span>
                    </h1>
                  </motion.div>

                  {/* Animated Tagline with Pen Icon */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex items-center space-x-3"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, 0],
                        x: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg"
                    >
                      <Feather className="h-6 w-6 text-white" />
                    </motion.div>
                    <span className="text-xl lg:text-2xl font-bold text-transparent bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text">
                      Think Less, Report More
                    </span>
                  </motion.div>

                  {/* Typing Text Animation with Writing Theme */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-lg text-slate-600 dark:text-slate-300">
                      Crafting{" "}
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={currentTextIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="font-semibold text-blue-600 dark:text-blue-400"
                        >
                          {typingTexts[currentTextIndex]}
                        </motion.span>
                      </AnimatePresence>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-blue-600 dark:text-blue-400 ml-1"
                      >
                        |
                      </motion.span>
                    </span>
                  </motion.div>
                </div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl"
                >
                  Transform your event documentation with our cutting-edge
                  AI-powered platform. Create professional, comprehensive
                  reports in minutes with intelligent automation designed
                  specifically for academic excellence.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    to="/generate"
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <PenTool className="mr-3 h-6 w-6" />
                    Start Writing Reports
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/team"
                    className="group bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-300 flex items-center justify-center shadow-lg"
                  >
                    <Users className="mr-3 h-5 w-5" />
                    Meet Our Team
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Content - Institution Logos Display */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="flex  justify-center lg:justify-end relative "
              >
                <div className="  relative w-full max-w-lg">
                  {/* Institution Logos Display */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 1, 0, -1, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative w-80 h-96 lg:w-96 lg:h-[450px] mx-auto"
                  >
                    {/* Three Institutional Logos */}
                    <div className="absolute inset-0 flex  items-center  justify-center space-x-8 ">
                      {/* BVM Logo */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.5,
                          duration: 0.8,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                      >
                        <div className=" w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-xl border-4 border-blue-300 overflow-hidden">
                          <img
                            src="/BVM Logo-1.png"
                            alt="BVM College"
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute -inset-2 rounded-full border-2 border-blue-400 opacity-30"
                        />
                      </motion.div>
                      {/* VL Logo */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 1,
                          duration: 0.8,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                      >
                        <div className=" w-24 h-24 sm:w-40  sm:h-40 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-xl border-4 border-purple-300 overflow-hidden">
                          <img
                            src="/VLlogo1.PNG"
                            alt="Vishvakarma Lekhan"
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                          }}
                          className="absolute -inset-2 rounded-full border-2  border-purple-400 opacity-30"
                        />
                      </motion.div>
                      {/* CVM Logo */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 1.5,
                          duration: 0.8,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                      >
                        <div className=" w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-br from-green-100 to-green-200   rounded-full flex items-center justify-center shadow-xl border-4 border-green-300 overflow-hidden">
                          <img
                            src="/CVM Logo.png"
                            alt="CVM Logo"
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                          }}
                          className="absolute -inset-2 rounded-full border-2 border-green-400 opacity-30"
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Floating Academic Elements */}
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-lg flex items-center justify-center"
                  >
                    <GraduationCap className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Academic Achievement Sparkles */}
                  {[
                    {
                      position: "top-4 right-4",
                      delay: 0,
                      color: "from-blue-400 to-blue-600",
                    },
                    {
                      position: "bottom-8 -left-4",
                      delay: 1,
                      color: "from-green-400 to-green-600",
                    },
                    {
                      position: "top-1/2 -right-8",
                      delay: 2,
                      color: "from-purple-400 to-purple-600",
                    },
                  ].map(({ position, delay, color }, index) => (
                    <motion.div
                      key={index}
                      animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 3 + delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: delay * 0.7,
                      }}
                      className={`absolute ${position} w-10 h-10 bg-gradient-to-br ${color} rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                  ))}

                  {/* Innovation Symbol */}
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -bottom-6 -right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Zap className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Powerful Features for
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Academic Excellence
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Discover the cutting-edge tools and capabilities that make
                Vishvakarma Lekhan the perfect choice for professional event
                documentation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: feature.delay, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-white/30 dark:from-slate-700/30 dark:to-slate-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-600/20 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                    {/* Icon */}
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Arrow */}
                    <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Steps Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Generate professional reports in just three simple steps with
                our intelligent workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2"></div>

              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative text-center group"
                >
                  {/* Step Number */}
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${step.color} text-white text-2xl font-bold shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}
                  >
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                      <step.icon className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Trusted by Educators
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Join thousands of faculty members and institutions who rely on
                our platform
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="group h-full"
                >
                  <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-600/20 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 flex flex-col h-full">
                    {/* Rating Stars */}
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-500 fill-current"
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-slate-600 dark:text-slate-300 mb-6 italic leading-relaxed min-h-[80px] overflow-y-auto">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center mt-auto">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {testimonial.role}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {testimonial.college}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your
                <span className="block text-yellow-400">
                  Event Documentation?
                </span>
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of educators who have already revolutionized
                their report generation process
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/generate"
                  className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center"
                >
                  <Rocket className="mr-3 h-6 w-6" />
                  Start Creating Now
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button className="group bg-white/10 backdrop-blur-lg border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Contact Sales
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
