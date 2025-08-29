import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building,
  Hash,
  X,
  AlertCircle,
} from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  rollNumber?: string;
}

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const { isDark } = useThemeStore();

  const loginForm = useForm<LoginFormData>();
  const registerForm = useForm<RegisterFormData>();

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      onClose();
    } catch (error) {
      // Error handled by the store
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError("confirmPassword", {
        message: "Passwords do not match",
      });
      return;
    }

    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        rollNumber: data.rollNumber,
      });
      onClose();
    } catch (error) {
      // Error handled by the store
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    loginForm.reset();
    registerForm.reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 text-xl"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center"
              >
                <AlertCircle size={16} className="mr-2" />
                {error}
              </motion.div>
            </AnimatePresence>
          )}

          {isLogin ? (
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...loginForm.register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...loginForm.register("password", {
                      required: "Password is required",
                    })}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 
                           disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-4"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerForm.register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerForm.register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Department & Roll Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Department (Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...registerForm.register("department")}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Roll Number (Optional)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...registerForm.register("rollNumber")}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 21BCS001"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerForm.register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerForm.register("confirmPassword", {
                      required: "Please confirm your password",
                    })}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 
                           disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={toggleMode}
              className="w-full text-center text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
