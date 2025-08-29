import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Shield,
  Save,
  Edit3,
  X,
  AlertCircle,
  Check,
  Camera,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Settings,
  Bell,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { api } from "../utils/api";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateData {
  name: string;
  email: string;
  department: string;
  designation?: string;
  contactNumber?: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  department?: string;
  designation?: string;
  contactNumber?: string;
  createdAt: string;
  lastLogin?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  reportUpdates: boolean;
  adminAlerts: boolean;
  systemMaintenance: boolean;
}

const EnhancedProfile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuthStore();
  const { isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "admin" | "settings" | "activity"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileUpdateData>({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    designation: user?.designation || "",
    contactNumber: user?.contactNumber || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Admin management state
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    reportUpdates: true,
    adminAlerts: user?.role === "admin",
    systemMaintenance: true,
  });

  // Activity state
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        department: user.department || "",
        designation: user.designation || "",
        contactNumber: user.contactNumber || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "admin" && user?.role === "admin") {
      loadUsers();
    } else if (activeTab === "activity") {
      loadActivities();
    }
  }, [activeTab, user?.role]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get("/auth/users");
      setUsers(response.data.users);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load users" });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadActivities = async () => {
    try {
      setLoadingActivities(true);
      // This would typically fetch user activity logs
      setActivities([
        {
          id: 1,
          action: "Profile updated",
          timestamp: new Date().toISOString(),
          type: "info",
        },
        {
          id: 2,
          action: "Password changed",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          type: "security",
        },
        {
          id: 3,
          action: "Report generated",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          type: "action",
        },
      ]);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load activities" });
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile(profileData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long",
      });
      return;
    }

    try {
      setLoading(true);
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to change password";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "admin"
  ) => {
    try {
      setLoading(true);
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setMessage({ type: "success", text: `User role updated to ${newRole}` });
      loadUsers();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update user role" });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      setMessage({ type: "error", text: "Please select users first" });
      return;
    }

    try {
      setLoading(true);
      await api.put("/auth/admin/users/bulk", {
        action,
        userIds: selectedUsers,
      });
      setMessage({
        type: "success",
        text: `Bulk ${action} completed successfully`,
      });
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      setMessage({ type: "error", text: `Failed to perform bulk ${action}` });
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => setMessage(null);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Security", icon: Lock },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "activity", label: "Activity", icon: Activity },
    ...(user?.role === "admin"
      ? [{ id: "admin", label: "User Management", icon: Shield }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {user?.name || "User Profile"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {user?.email}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === "admin"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {user?.role === "admin" ? "Administrator" : "User"}
                </span>
                {user?.department && (
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {message.type === "success" ? (
                <Check size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
              <button
                onClick={clearMessage}
                className="ml-auto"
                aria-label="Close message"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Profile Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                      <span>{isEditing ? "Cancel" : "Edit"}</span>
                    </button>
                  </div>

                  <form
                    onSubmit={handleProfileUpdate}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div>
                      <label
                        htmlFor="profile-name"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-email"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-department"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Department
                      </label>
                      <input
                        id="profile-department"
                        type="text"
                        value={profileData.department}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            department: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500"
                        placeholder="e.g., Computer Engineering"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-designation"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Designation
                      </label>
                      <input
                        id="profile-designation"
                        type="text"
                        value={profileData.designation}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            designation: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500"
                        placeholder="e.g., Professor, Student"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-contact"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Contact Number
                      </label>
                      <input
                        id="profile-contact"
                        type="tel"
                        value={profileData.contactNumber}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            contactNumber: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Account Type
                      </label>
                      <div className="flex items-center space-x-2 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user?.role === "admin"
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {user?.role === "admin" ? "Administrator" : "User"}
                        </span>
                        {user?.role === "admin" && (
                          <Shield size={16} className="text-purple-500" />
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          <span>{loading ? "Saving..." : "Save Changes"}</span>
                        </button>
                      </div>
                    )}
                  </form>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === "password" && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Security Settings
                  </h2>

                  <form
                    onSubmit={handlePasswordChange}
                    className="space-y-4 max-w-md"
                  >
                    <div>
                      <label
                        htmlFor="current-password"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        New Password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        minLength={6}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Confirm New Password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        minLength={6}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Lock size={16} />
                      )}
                      <span>{loading ? "Changing..." : "Change Password"}</span>
                    </button>
                  </form>

                  {/* Security Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Security Tips
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                      <li>
                        • Use a strong password with at least 8 characters
                      </li>
                      <li>
                        • Include uppercase, lowercase, numbers, and symbols
                      </li>
                      <li>
                        • Don't use the same password for multiple accounts
                      </li>
                      <li>• Change your password regularly</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Notification Settings
                  </h2>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Bell size={20} className="text-slate-400" />
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Receive notifications for this category
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                [key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Recent Activity
                  </h2>

                  {loadingActivities ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              activity.type === "security"
                                ? "bg-red-500"
                                : activity.type === "action"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-slate-900 dark:text-white">
                              {activity.action}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Admin Tab - Enhanced */}
              {activeTab === "admin" && user?.role === "admin" && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      User Management
                    </h2>
                    {selectedUsers.length > 0 && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBulkAction("activate")}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleBulkAction("deactivate")}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Deactivate
                        </button>
                        <button
                          onClick={() => handleBulkAction("promote")}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                        >
                          Promote
                        </button>
                      </div>
                    )}
                  </div>

                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((userData) => (
                        <div
                          key={userData._id}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(userData._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers([
                                      ...selectedUsers,
                                      userData._id,
                                    ]);
                                  } else {
                                    setSelectedUsers(
                                      selectedUsers.filter(
                                        (id) => id !== userData._id
                                      )
                                    );
                                  }
                                }}
                                className="rounded"
                              />
                              <div>
                                <h3 className="font-medium text-slate-900 dark:text-white">
                                  {userData.name}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {userData.email}
                                </p>
                                {userData.department && (
                                  <p className="text-sm text-slate-500 dark:text-slate-500">
                                    {userData.department}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  userData.role === "admin"
                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                }`}
                              >
                                {userData.role}
                              </span>
                              {userData._id !== user?._id && (
                                <button
                                  onClick={() =>
                                    handleRoleChange(
                                      userData._id,
                                      userData.role === "admin"
                                        ? "user"
                                        : "admin"
                                    )
                                  }
                                  disabled={loading}
                                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                    userData.role === "admin"
                                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                                      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                                  }`}
                                >
                                  {userData.role === "admin"
                                    ? "Demote"
                                    : "Promote"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfile;
