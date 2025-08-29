import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  UserX,
} from "lucide-react";
import { useReportStore, EventReport } from "../store/reportStore";
import { useAuthStore } from "../store/authStore";
import { downloadReportAsDocx } from "../utils/downloadDocx";
import { toast } from "react-hot-toast";

const ReportHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    reports,
    loading,
    error,
    deleteReport,
    setCurrentReport,
    loadReports,
    clearError,
  } = useReportStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "generated"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  // Load reports on component mount and when filters change
  useEffect(() => {
    const statusFilter = filterStatus === "all" ? undefined : filterStatus;
    const searchFilter = searchTerm.trim() === "" ? undefined : searchTerm;

    loadReports(currentPage, reportsPerPage, statusFilter, searchFilter);
  }, [currentPage, filterStatus, searchTerm, loadReports]);

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const filteredReports = reports.sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return a.title.localeCompare(b.title);
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      const success = await deleteReport(id);
      if (success) {
        // Reload reports after deletion
        const statusFilter = filterStatus === "all" ? undefined : filterStatus;
        const searchFilter = searchTerm.trim() === "" ? undefined : searchTerm;
        loadReports(currentPage, reportsPerPage, statusFilter, searchFilter);
      }
    }
  };

  const handleEdit = (report: EventReport) => {
    setCurrentReport(report);
    navigate("/generate");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (status: "all" | "draft" | "generated") => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDownload = (report: EventReport) => {
    if (report.status === "generated") {
      downloadReportAsDocx(report);
      toast.success("Report downloaded successfully");
    } else {
      toast.error("Please generate the report first");
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "generated" ? (
      <CheckCircle className="text-green-500" size={16} />
    ) : (
      <Clock className="text-yellow-500" size={16} />
    );
  };

  const getStatusText = (status: string) => {
    return status === "generated" ? "Generated" : "Draft";
  };

  // Show loading state
  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <span className="ml-4 text-lg text-gray-600 dark:text-gray-400">
              Loading reports...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  clearError();
                  const statusFilter =
                    filterStatus === "all" ? undefined : filterStatus;
                  const searchFilter =
                    searchTerm.trim() === "" ? undefined : searchTerm;
                  loadReports(
                    currentPage,
                    reportsPerPage,
                    statusFilter,
                    searchFilter
                  );
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Report History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and access all your event reports
          </p>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) =>
                  handleFilterChange(
                    e.target.value as "all" | "draft" | "generated"
                  )
                }
                title="Filter by status"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="generated">Generated</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "title")}
              title="Sort by"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </motion.div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center"
          >
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You haven't created any reports yet"}
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FileText className="mr-2" size={20} />
              Create Your First Report
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <span
                        className={`text-sm font-medium ${
                          report.status === "generated"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDownload(report)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(report)}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {report.title}
                    </h3>
                    {report.tagline && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                        {report.tagline}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(report.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      {report.eventType && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                          {report.eventType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {report.venue && (
                      <div className="flex items-center justify-between">
                        <span>Venue:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {report.venue}
                        </span>
                      </div>
                    )}
                    {report.organizedBy && (
                      <div className="flex items-center justify-between">
                        <span>Organized by:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {report.organizedBy}
                        </span>
                      </div>
                    )}
                    {report.participantCount && (
                      <div className="flex items-center justify-between">
                        <span>Participants:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {report.participantCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {new Date(report.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <FileText size={12} />
                      <span>{report.contentBlocks?.length || 0} blocks</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleEdit(report)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      <Edit className="mr-1" size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDownload(report)}
                      disabled={report.status !== "generated"}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="mr-1" size={14} />
                      Download
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Summary Stats */}
        {reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Summary Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {reports.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Reports
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {reports.filter((r) => r.status === "generated").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Generated
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {reports.filter((r) => r.status === "draft").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Drafts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {reports.reduce(
                    (acc, r) => acc + (r.contentBlocks?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Content Blocks
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReportHistory;
