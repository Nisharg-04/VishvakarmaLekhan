import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Globe, Mail } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, generate reports, or contact us for support. This may include your name, email address, institutional affiliation, and report content.",
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect certain information about your use of our services, including your IP address, browser type, operating system, access times, and pages viewed.",
        },
        {
          subtitle: "Report Data",
          text: "We collect and process the content of reports you create, including event details, participant information, and any uploaded files or images used in report generation.",
        },
      ],
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our report generation services, including AI-powered content creation and template customization.",
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you service-related announcements, updates about new features, and respond to your inquiries.",
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to understand how our services are used and to make improvements to functionality and user experience.",
        },
      ],
    },
    {
      title: "Information Sharing and Disclosure",
      icon: Globe,
      content: [
        {
          subtitle: "Service Providers",
          text: "We may share your information with third-party service providers who help us operate our services, such as cloud hosting providers and analytics services.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required to do so by law or in response to valid requests by public authorities.",
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.",
        },
      ],
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        {
          subtitle: "Encryption",
          text: "We use industry-standard encryption to protect your data both in transit and at rest. All communications with our servers are secured using SSL/TLS encryption.",
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls to ensure that only authorized personnel can access your personal information, and only when necessary for service provision.",
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and assessments to identify and address potential vulnerabilities in our systems.",
        },
      ],
    },
    {
      title: "Your Rights and Choices",
      icon: Shield,
      content: [
        {
          subtitle: "Account Information",
          text: "You can update your account information at any time through your profile settings. You have the right to request access to, correction of, or deletion of your personal information.",
        },
        {
          subtitle: "Data Portability",
          text: "You can export your report data at any time in standard formats. We provide tools to help you download your reports and associated data.",
        },
        {
          subtitle: "Communication Preferences",
          text: "You can opt out of non-essential communications by updating your preferences in your account settings or following the unsubscribe instructions in our emails.",
        },
      ],
    },
    {
      title: "Contact Information",
      icon: Mail,
      content: [
        {
          subtitle: "Privacy Officer",
          text: "If you have questions about this Privacy Policy or our data practices, please contact our Privacy Officer at privacy@bvm-reports.edu.",
        },
        {
          subtitle: "Data Protection Authority",
          text: "You have the right to lodge a complaint with your local data protection authority if you believe we have not complied with applicable data protection laws.",
        },
        {
          subtitle: "Updates to This Policy",
          text: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and sending you an email notification.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your information.
            </p>
            <div className="mt-8 text-sm text-slate-500 dark:text-slate-400">
              Last updated: August 29, 2025
            </div>
          </motion.div>

          {/* Privacy Sections */}
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                        {item.subtitle}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-4">
              Questions About Your Privacy?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              We're here to help. Contact us if you have any questions about how
              we handle your data.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
            >
              Contact Privacy Team
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
