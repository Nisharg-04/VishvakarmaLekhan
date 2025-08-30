import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { EventReport } from "../store/reportStore";

interface ReportPreviewProps {
  report: Partial<EventReport>;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ report }) => {
  if (!report.title) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded shadow border border-gray-300 dark:border-gray-600 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Start filling the form to see a live preview of your report
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 shadow-lg border border-gray-300 dark:border-gray-600 p-10 space-y-8 font-serif max-w-4xl mx-auto"
      style={{ minHeight: "29.7cm", width: "21cm" }} // A4 proportions
    >
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 dark:border-gray-600 pb-8">
        {/* Selected Logos */}
        {report.selectedLogos && report.selectedLogos.length > 0 && (
          <div className="flex justify-center items-center space-x-6 mb-6">
            {report.selectedLogos.map((logoId) => {
              const logoConfig = {
                bvm: {
                  src: "/BVM Logo-1.png",
                  alt: "Birla Vishvakarma Mahavidyalaya",
                },
                cvm: {
                  src: "/CVM Logo.png",
                  alt: "Charotar Vidya Mandal",
                },
                gtu: {
                  src: "/GTU.png",
                  alt: "Gujarat Technological University",
                },
                nss: {
                  src: "/nss.png",
                  alt: "National Service Scheme",
                },
                NCC: {
                  src: "/NCC logo.png",
                  alt: "National Cadet Corps",
                },
                ieee: {
                  src: "/IEEE BVM SB.png",
                  alt: "IEEE BVM Student Branch",
                },
                TRS: {
                  src: "/TRS Logo.jpg",
                  alt: "The Robotics Society",
                },
                TSA: {
                  src: "/TSA Logo.png",
                  alt: "The Space Association",
                },
                gdg: {
                  src: "/GDG.png",
                  alt: "Google Developer Group",
                },
                gfg: {
                  src: "/GFG Logo.jpg",
                  alt: "GeeksforGeeks Student Chapter",
                },
                "ML Club": {
                  src: "/ML Club Logo.png",
                  alt: "Machine Learning Club",
                },
                csi: {
                  src: "/CSI.jpeg",
                  alt: "Computer Society of India",
                },
                byte: {
                  src: "/BYTE.jpeg",
                  alt: "BYTE Society",
                },
              }[logoId];

              if (!logoConfig) return null;

              return (
                <div key={logoId} className="flex flex-col items-center">
                  <img
                    src={logoConfig.src}
                    alt={logoConfig.alt}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Institution Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            BIRLA VISHVAKARMA MAHAVIDYALAYA
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Engineering College • Gujarat Technological University
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vallabh Vidyanagar, Anand - 388120
          </p>
        </div>

        {/* Event Title */}
        <div className="border-t border-b border-gray-200 dark:border-gray-600 py-4 my-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 uppercase">
            {report.title}
          </h1>
          {report.tagline && (
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
              {report.tagline}
            </p>
          )}
        </div>

        {/* Event Type and Organized By */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {report.eventType && (
            <p className="font-medium">{report.eventType}</p>
          )}
          {report.organizedBy && <p>Organized by: {report.organizedBy}</p>}
        </div>
      </div>

      {/* Event Details */}
      <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase">
          Event Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.startDate && (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                Date & Time
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {new Date(report.startDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
                {report.endDate &&
                  ` - ${new Date(report.endDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}`}
              </p>
            </div>
          )}

          {report.venue && (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                Venue
              </p>
              <p className="text-gray-700 dark:text-gray-300">{report.venue}</p>
            </div>
          )}

          {report.targetAudience && (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                Target Audience
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {report.targetAudience}
              </p>
            </div>
          )}

          {report.participantCount && (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                Number of Participants
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {report.participantCount}
              </p>
            </div>
          )}

          {report.academicYear && (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                Academic Year
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {report.academicYear}
              </p>
            </div>
          )}

          {report.semester && (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                Semester
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {report.semester}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* People Involved */}
      {((report.facultyCoordinators && report.facultyCoordinators.length > 0) ||
        (report.studentCoordinators && report.studentCoordinators.length > 0) ||
        report.chiefGuest?.name) && (
        <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase">
            People Involved
          </h3>
          <div className="space-y-4">
            {report.facultyCoordinators &&
              report.facultyCoordinators.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-2">
                    Faculty Coordinators
                  </p>
                  <div className="space-y-1">
                    {report.facultyCoordinators.map((coordinator, index) => (
                      <p
                        key={index}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {coordinator.name}
                        {coordinator.designation &&
                          `, ${coordinator.designation}`}
                        {coordinator.email && ` (${coordinator.email})`}
                      </p>
                    ))}
                  </div>
                </div>
              )}

            {report.studentCoordinators &&
              report.studentCoordinators.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-2">
                    Student Coordinators
                  </p>
                  <div className="space-y-1">
                    {report.studentCoordinators.map((coordinator, index) => (
                      <p
                        key={index}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {coordinator.name}
                        {coordinator.rollNo && ` (${coordinator.rollNo})`}
                        {coordinator.contact && ` - ${coordinator.contact}`}
                      </p>
                    ))}
                  </div>
                </div>
              )}

            {report.chiefGuest?.name && (
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-2">
                  Chief Guest
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {report.chiefGuest.name}
                  {report.chiefGuest.designation &&
                    `, ${report.chiefGuest.designation}`}
                  {report.chiefGuest.affiliation &&
                    `, ${report.chiefGuest.affiliation}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Blocks */}
      {report.contentBlocks && report.contentBlocks.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase">
            Event Content
          </h3>
          <div className="space-y-6">
            {report.contentBlocks.map((block, index) => (
              <div key={block.id} className="space-y-3">
                {block.title && (
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                    {index + 1}. {block.title}
                  </h4>
                )}

                {block.type === "image" &&
                  (block.imageUrls?.length || block.imageUrl) && (
                    <div className="space-y-2">
                      <div className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700">
                        {block.imageUrls && block.imageUrls.length > 1 ? (
                          <div
                            className={`grid gap-2 ${
                              block.imageLayout === "grid"
                                ? "grid-cols-2"
                                : block.imageLayout === "row"
                                ? "grid-cols-3"
                                : "grid-cols-1"
                            }`}
                          >
                            {block.imageUrls.map((imageUrl, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={imageUrl}
                                alt={`${block.caption || block.title} ${
                                  imgIndex + 1
                                }`}
                                className={`w-full object-contain mx-auto ${
                                  block.imageLayout === "row" ? "h-32" : "h-48"
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={block.imageUrls?.[0] || block.imageUrl}
                            alt={block.caption || block.title}
                            className="w-full max-w-2xl h-auto object-contain mx-auto"
                          />
                        )}
                      </div>
                      {block.caption && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
                          {block.caption}
                        </p>
                      )}
                      {block.credit && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
                          Photo Credit: {block.credit}
                        </p>
                      )}
                    </div>
                  )}

                {block.type === "quote" && block.content && (
                  <div className="border-l-4 border-gray-400 dark:border-gray-500 pl-6 py-3 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-start space-x-3">
                      <Quote
                        className="text-gray-600 dark:text-gray-400 mt-1 flex-shrink-0"
                        size={20}
                      />
                      <p className="text-gray-800 dark:text-gray-200 italic font-medium leading-relaxed">
                        "{block.content}"
                      </p>
                    </div>
                  </div>
                )}

                {(block.type === "text" || block.type === "achievement") &&
                  block.content && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                        {block.content}
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Section */}
      <div className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-gray-400 dark:border-gray-500 pt-2 mt-16">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Event Coordinator
              </p>
              {report.facultyCoordinators && report.facultyCoordinators[0] && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {report.facultyCoordinators[0].name}
                </p>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 dark:border-gray-500 pt-2 mt-16">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Head of Department
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {report.organizedBy || "Department"}
              </p>
            </div>
          </div>
        </div>

        {/* Report Footer */}
        <div className="text-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Report generated on{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            • Birla Vishvakarma Mahavidyalaya
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportPreview;
