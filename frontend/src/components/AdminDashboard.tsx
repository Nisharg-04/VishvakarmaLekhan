import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  Users,
  FileText,
  UserCheck,
  UserX,
  Shield,
  Calendar,
  TrendingUp,
  Eye,
  Trash2,
  MoreVertical,
  Download,
  AlertCircle,
  X,
  UserPlus,
  Settings,
  Activity,
  BarChart,
} from "lucide-react";
import {
  updateUserRole as apiUpdateUserRole,
  getAllUsers,
  deleteUser,
  bulkUpdateUsers,
  getUserStats,
  getAdminReport,
  generateSummaryReport,
  User as ApiUser,
} from "../utils/api";
import { downloadReportAsDocx } from "../utils/downloadDocx";
import { toast } from "react-hot-toast";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentUsers: number;
  inactiveUsers: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  department: string;
  rollNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Report {
  _id: string;
  title: string;
  organizedBy: string;
  status: "draft" | "generated";
  createdBy: {
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const { isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "reports">(
    "overview"
  );
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Report search and filter states
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState<
    "all" | "draft" | "generated"
  >("all");
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
      fetchUsers();
      fetchReports();
    }
  }, [user]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) =>
        statusFilter === "active" ? u.isActive : !u.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Filter reports based on search and filters
  useEffect(() => {
    let filtered = reports;

    // Apply search filter
    if (reportSearchQuery.trim()) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
          r.organizedBy
            .toLowerCase()
            .includes(reportSearchQuery.toLowerCase()) ||
          r.createdBy?.name
            .toLowerCase()
            .includes(reportSearchQuery.toLowerCase()) ||
          r.createdBy?.email
            .toLowerCase()
            .includes(reportSearchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (reportStatusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === reportStatusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, reportSearchQuery, reportStatusFilter]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (response.ok) {
        await fetchUsers();
        await fetchStats();
      } else {
        const error = await response.json();
        setError(error.message || "Failed to update user status");
      }
    } catch (error) {
      setError("Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/admin/users/${userId}/promote`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchUsers();
        await fetchStats();
      } else {
        const error = await response.json();
        setError(error.message || "Failed to promote user");
      }
    } catch (error) {
      setError("Failed to promote user");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "user" | "admin") => {
    setLoading(true);
    try {
      await apiUpdateUserRole(userId, newRole);
      await fetchUsers();
      await fetchStats();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to update user role"
      );
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (reportId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reports/admin/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data.report || data);
        setShowReportModal(true);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message ||
            errorData.error ||
            "Failed to load report details"
        );
      }
    } catch (error) {
      console.error("View report error:", error);
      setError("Failed to load report details");
    }
  };

  const deleteReport = async (reportId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this report? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchReports();
        setError(null);
      } else {
        const error = await response.json();
        setError(error.message || "Failed to delete report");
      }
    } catch (error) {
      setError("Failed to delete report");
    } finally {
      setLoading(false);
    }
  };

  // Download full report function
  const downloadFullReport = async (reportId: string, reportTitle: string) => {
    try {
      setLoading(true);

      // Get the full report data
      const reportData = await getAdminReport(reportId);

      if (!reportData.generatedContent) {
        toast.error(
          "Report content not generated yet. Please generate the report first."
        );
        return;
      }

      // Download the full report
      await downloadReportAsDocx(reportData);

      toast.success("Full report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading full report:", error);
      toast.error("Failed to download full report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Download summary report function
  const downloadSummaryReport = async (
    reportId: string,
    reportTitle: string
  ) => {
    try {
      setLoading(true);

      // Get the full report data
      const reportData = await getAdminReport(reportId);

      // Generate summary content
      const summaryContent = await generateSummaryReport(reportData);

      // Create summary report data
      const summaryReportData = {
        ...reportData,
        generatedContent: summaryContent,
        contentBlocks: [], // No content blocks in summary
        attendanceSheets: [],
        miscellaneousFiles: [],
      };

      // Download summary with custom filename
      await downloadReportAsDocx(summaryReportData, `${reportTitle}_Summary`);

      toast.success("Summary report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading summary report:", error);
      toast.error("Failed to download summary report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 pt-16">
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Manage users, reports, and system settings
                </p>
              </div>
            </div>

            <div className="mt-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                {["overview", "users", "reports"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(tab as "overview" | "users" | "reports")
                    }
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center justify-between"
            >
              <div className="flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Close error message"
              >
                <X size={18} />
              </button>
            </motion.div>
          </AnimatePresence>
        )}

        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-gray-400 dark:text-slate-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                            Total Users
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {stats.totalUsers}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserCheck className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                            Active Users
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {stats.activeUsers}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Shield className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                            Admin Users
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {stats.adminUsers}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                            New This Week
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {stats.recentUsers}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                            Total Reports
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {reports.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {reports.slice(0, 5).map((report) => (
                    <div
                      key={report._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {report.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {report.createdBy?.name || "Unknown"} •
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === "generated"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4 sm:mb-0">
                  User Management
                </h3>

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                    />
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  </div>

                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) =>
                      setRoleFilter(e.target.value as "all" | "admin" | "user")
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as "all" | "active" | "inactive"
                      )
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                    {filteredUsers.map((userItem) => (
                      <tr key={userItem._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {userItem.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">
                              {userItem.email}
                            </div>
                            {userItem.rollNumber && (
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                #{userItem.rollNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {userItem.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userItem.role === "admin"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userItem.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {userItem.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                toggleUserStatus(
                                  userItem._id,
                                  !userItem.isActive
                                )
                              }
                              disabled={loading}
                              className={`${
                                userItem.isActive
                                  ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              } disabled:opacity-50 transition-colors`}
                              title={
                                userItem.isActive
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              {userItem.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                updateUserRole(
                                  userItem._id,
                                  userItem.role === "admin" ? "user" : "admin"
                                )
                              }
                              disabled={loading || userItem._id === user?._id}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50 transition-colors"
                              title={
                                userItem.role === "admin"
                                  ? "Demote to User"
                                  : "Promote to Admin"
                              }
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
                    <p className="text-gray-500 dark:text-slate-400">
                      No users found matching your criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4 sm:mb-0">
                  Report Management
                </h3>

                {/* Report Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={reportSearchQuery}
                      onChange={(e) => setReportSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                    />
                    <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={reportStatusFilter}
                    onChange={(e) =>
                      setReportStatusFilter(
                        e.target.value as "all" | "draft" | "generated"
                      )
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="generated">Generated</option>
                  </select>

                  {/* Type Filter removed - all reports now require authentication */}
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Showing {filteredReports.length} of {reports.length} reports
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Report
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                    {filteredReports.map((report) => (
                      <tr key={report._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {report.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">
                              {report.organizedBy}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">
                                {report.createdBy?.name || "Unknown"}
                              </div>
                              <div className="text-gray-500 dark:text-slate-400">
                                {report.createdBy?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.status === "generated"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              onClick={() => viewReport(report._id)}
                              title="View Report"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {report.status === "generated" && (
                              <>
                                <button
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                  onClick={() =>
                                    downloadFullReport(report._id, report.title)
                                  }
                                  disabled={loading}
                                  title="Download Full Report"
                                >
                                  <Download className="h-4 w-4" />
                                </button>

                                <button
                                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                                  onClick={() =>
                                    downloadSummaryReport(
                                      report._id,
                                      report.title
                                    )
                                  }
                                  disabled={loading}
                                  title="Download Summary"
                                >
                                  <FileText className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            <button
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              onClick={() => deleteReport(report._id)}
                              disabled={loading}
                              title="Delete Report"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredReports.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
                    <p className="text-gray-500 dark:text-slate-400">
                      No reports found matching your criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Report Details
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedReport.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    Organized by: {selectedReport.organizedBy}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Status
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedReport.status === "generated"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {selectedReport.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Created
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedReport.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                    Created By
                  </p>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedReport.createdBy?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {selectedReport.createdBy?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                <button
                  onClick={() => deleteReport(selectedReport._id)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Delete Report
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
