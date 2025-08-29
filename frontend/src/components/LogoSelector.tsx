import React from "react";
import { motion } from "framer-motion";
import { Check, Image as ImageIcon } from "lucide-react";

interface LogoSelectorProps {
  selectedLogos: string[];
  onLogoToggle: (logoId: string) => void;
}

const LogoSelector: React.FC<LogoSelectorProps> = ({
  selectedLogos,
  onLogoToggle,
}) => {
  const availableLogos = [
    {
      id: "bvm",
      name: "BVM Logo",
      description: "Birla Vishvakarma Mahavidyalaya",
      preview: "/BVM Logo-1.png",
      required: true,
    },
    {
      id: "cvm",
      name: "CVM Logo",
      description: "Charotar Vidya Mandal",
      preview: "/CVM Logo.png",
      required: false,
    },
    {
      id: "gtu",
      name: "GTU Logo",
      description: "Gujarat Technological University",
      preview: "/GTU.png",
      required: false,
    },
    {
      id: "nss",
      name: "NSS Logo",
      description: "National Service Scheme",
      preview: "/nss.png",
      required: false,
    },
    {
      id: "NCC",
      name: "NCC Logo",
      description: "National Cadet Corps",
      preview: "/NCC logo.png",
      required: false,
    },
    {
      id: "ieee",
      name: "IEEE Logo",
      description: "Institute of Electrical and Electronics Engineers",
      preview: "/IEEE BVM SB.png",
      required: false,
    },
    {
      id: "TRS",
      name: "TRS Logo",
      description: "The Robotics Society",
      preview: "/TRS Logo.jpg",
      required: false,
    },
    {
      id: "TSA",
      name: "TSA Logo",
      description: "The Space Association",
      preview: "/TSA Logo.png",
      required: false,
    },

    {
      id: "gdg",
      name: "GDG Logo",
      description: "Google Developer Group",
      preview: "/GDG.png",
      required: false,
    },
    {
      id: "gfg",
      name: "GFG Logo",
      description: "GeeksforGeeks Student Chapter",
      preview: "GFG Logo.jpg",
      required: false,
    },
    {
      id: "ML Club",
      name: "ML Club Logo",
      description: "Machine Learning Club",
      preview: "/ML Club Logo.png",
      required: false,
    },

    {
      id: "csi",
      name: "CSI Logo",
      description: "Computer Society of India",
      preview: "/CSI.jpeg",
      required: false,
    },
    {
      id: "byte",
      name: "BYTE Club Logo",
      description: "BYTE Club",
      preview: "/BYTE.jpeg",
      required: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <ImageIcon className="text-blue-700 dark:text-blue-400" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Select Report Logos
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose which logos to include in your report header
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableLogos.map((logo) => {
          const isSelected = selectedLogos.includes(logo.id);
          const isRequired = logo.required;

          return (
            <motion.div
              key={logo.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500"
              } ${isRequired ? "opacity-75 cursor-not-allowed" : ""}`}
              onClick={() => !isRequired && onLogoToggle(logo.id)}
            >
              {/* Selection Indicator */}
              <div
                className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? "bg-blue-500 border-blue-500"
                    : "border-slate-300 dark:border-slate-500"
                }`}
              >
                {isSelected && <Check size={12} className="text-white" />}
              </div>

              {/* Logo Preview */}
              <div className="flex items-center justify-center h-16 mb-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                {logo.preview ? (
                  <img
                    src={logo.preview}
                    alt={logo.name}
                    className="h-12 w-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const nextElement = e.currentTarget
                        .nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`${
                    logo.preview ? "hidden" : "flex"
                  } items-center justify-center h-12 w-12 bg-slate-200 dark:bg-slate-600 rounded-lg`}
                >
                  <ImageIcon size={24} className="text-slate-400" />
                </div>
              </div>

              {/* Logo Info */}
              <div className="text-center">
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                  {logo.name}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {logo.description}
                </p>
                {isRequired && (
                  <p className="text-xs text-red-500 mt-1">Required</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> Selected logos will appear in the header of
          your generated report. BVM logo is required and will always be
          included.
        </p>
      </div>
    </motion.div>
  );
};

export default LogoSelector;
