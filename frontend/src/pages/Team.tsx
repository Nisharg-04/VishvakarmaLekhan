import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Mail, Users } from "lucide-react";

const Team: React.FC = () => {
  const teamMembers = [
    {
      name: "Er. Bhikhubhai Patel",
      role: "Chairman CVM",
      photo: "/Chairman.jpg",
      social: {
        email: "chairman@cvm.edu.in",
        linkedin: "https://linkedin.com/in/bhikhubhai-patel",
      },
    },
    {
      name: "Prof. (Dr.) Vinay J. Patel",
      role: "I/C Principal",
      photo: "/VINAY_SIR.jpg",
      social: {
        email: "principal@bvm.edu.in",
        linkedin: "https://linkedin.com/in/vinay-patel",
      },
    },
    {
      name: "Prof. Mayur M. Sevak",
      role: "Faculty Guide & Programme Officer NSS",
      photo: "/MAYUR_SIR.jpg",
      social: {
        email: "mayur.sevak@bvm.edu.in",
        linkedin: "https://linkedin.com/in/mayur-sevak",
      },
    },
    {
      name: "Nisharg Soni",
      role: "Development Head & Project Lead - 4th Year Computer Engineering Student",
      photo: "/NISHARG.png",
      social: {
        email: "nisharg@bvm.edu.in",
        linkedin: "https://linkedin.com/in/nisharg-soni",
      },
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
            className="text-center mb-16"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The dedicated team behind Vishvakarma Lekhan at BVM Engineering
              College
            </p>
          </motion.div>

          {/* Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 text-center hover:shadow-2xl transition-all duration-300"
              >
                {/* Photo */}
                <div className="w-40 h-40 mx-auto mb-6 overflow-hidden rounded-full shadow-lg">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {member.name}
                </h3>

                {/* Role */}
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 min-h-[3rem] flex items-center justify-center">
                  {member.role}
                </p>

                {/* Contact Links */}
                <div className="flex gap-4 justify-center">
                  <a
                    href={`mailto:${member.social.email}`}
                    title={`Email ${member.name}`}
                    className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </a>
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${member.name} LinkedIn`}
                    className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Project Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Vishvakarma Lekhan</h2>
            <p className="text-xl opacity-90 mb-6">
              An innovative academic project developed at BVM Engineering
              College for automated report generation
            </p>
            <div className="text-lg opacity-75">
              <p>Birla Vishvakarma Mahavidyalaya</p>
              <p>Computer Engineering Department</p>
              <p>Under NSS Guidance</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Team;
