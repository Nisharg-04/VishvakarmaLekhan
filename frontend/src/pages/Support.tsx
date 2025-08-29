import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageSquare,
  Book,
  Video,
  Mail,
  Phone,
  Clock,
  Search,
  FileText,
  Users,
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

const Support: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      gradient: "from-blue-500 to-cyan-500",
      available: "24/7"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message about your issue",
      action: "Send Email",
      gradient: "from-green-500 to-teal-500",
      available: "Response within 24h"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our technical team",
      action: "Call Now",
      gradient: "from-purple-500 to-pink-500",
      available: "Mon-Fri 9AM-6PM"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Get quick answers from our LekhakAI helper",
      action: "Ask AI",
      gradient: "from-orange-500 to-red-500",
      available: "Always Available"
    }
  ];

  const resources = [
    {
      icon: Book,
      title: "Documentation",
      description: "Comprehensive guides and API references",
      link: "#"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides for all features",
      link: "#"
    },
    {
      icon: FileText,
      title: "Knowledge Base",
      description: "Articles and solutions for common issues",
      link: "#"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other users and share tips",
      link: "#"
    }
  ];

  const faqs = [
    {
      question: "How do I generate my first report?",
      answer: "To generate your first report, log in to your account, click 'Generate Report', fill in the event details, and let our AI create a professional report for you. You can customize the template and add additional information as needed."
    },
    {
      question: "What file formats can I export my reports to?",
      answer: "You can export your reports in multiple formats including DOCX (Microsoft Word), PDF, and HTML. Each format maintains professional formatting and can be customized according to your needs."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take data security very seriously. All data is encrypted in transit and at rest, we use industry-standard security practices, and we never share your report content with third parties. You can read more in our Privacy Policy."
    },
    {
      question: "Can I collaborate with my team on reports?",
      answer: "Absolutely! Our platform supports real-time collaboration. You can invite team members to edit reports, leave comments, and track changes. Different permission levels ensure proper access control."
    },
    {
      question: "How does the AI-powered generation work?",
      answer: "Our LekhakAI uses advanced natural language processing to analyze your event data and generate professional content. It understands context, maintains consistency, and follows academic and corporate writing standards."
    },
    {
      question: "What if I need to customize report templates?",
      answer: "You can fully customize report templates including logos, color schemes, fonts, and layout. We also provide pre-designed templates for different types of events and organizations."
    },
    {
      question: "How do I integrate institutional logos?",
      answer: "You can upload your institutional logos in the profile settings. The system supports multiple logos and automatically places them in appropriate positions within your reports."
    },
    {
      question: "What are the system requirements?",
      answer: "Our platform is web-based and works on any modern browser (Chrome, Firefox, Safari, Edge). For mobile access, we recommend using the latest version of your mobile browser. No additional software installation is required."
    }
  ];

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              How can we help you?
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Find answers, get support, and learn how to make the most of our report generation platform.
            </p>
          </motion.div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {supportOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${option.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {option.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {option.description}
                </p>
                <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  {option.available}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full bg-gradient-to-r ${option.gradient} text-white py-2 px-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  {option.action}
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Helpful Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <motion.a
                  key={index}
                  href={resource.link}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                    {resource.title}
                    <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {resource.description}
                  </p>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-6 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-300 flex items-center justify-between"
                  >
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    )}
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 bg-white dark:bg-slate-800"
                    >
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-300">
                  No FAQs found matching your search. Try different keywords or contact support.
                </p>
              </div>
            )}
          </motion.div>

          {/* Still Need Help */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-lg mb-6 opacity-90">
              Our support team is ready to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Schedule a Call
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Support;
