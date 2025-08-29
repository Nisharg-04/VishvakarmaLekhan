import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  fullName: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  rollNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    department?: string;
    rollNumber?: string;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: User) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }

          const data = await response.json();
          const userData = {
            ...data.user,
            name: data.user.fullName || data.user.name // Map fullName to name for compatibility
          };
          set({
            user: userData,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
          }

          const data = await response.json();
          const mappedUserData = {
            ...data.user,
            name: data.user.fullName || data.user.name // Map fullName to name for compatibility
          };
          set({
            user: mappedUserData,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear any cached data
        localStorage.removeItem('auth-storage');
        sessionStorage.clear();
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData: User) => {
        set({ user: userData });
      },

      updateProfile: async (userData) => {
        const { token } = get();
        if (!token) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const error = await response.json();
            
            // Handle specific error cases
            if (response.status === 401 || response.status === 403) {
              // Token is invalid or account deactivated
              set({ 
                user: null, 
                token: null, 
                isAuthenticated: false,
                error: error.message || 'Authentication failed'
              });
              // Clear localStorage
              localStorage.removeItem('auth-storage');
              throw new Error(error.message || 'Authentication failed');
            }
            throw new Error(error.message || 'Profile update failed');
          }

          const data = await response.json();
          // Update user in store with new data
          set({
            user: {
              ...data.user,
              name: data.user.name || data.user.fullName // Ensure name mapping
            },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false,
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { token } = get();
        if (!token) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          });

          if (!response.ok) {
            const error = await response.json();
            
            // Handle specific error cases
            if (response.status === 401 || response.status === 403) {
              // Token is invalid or account deactivated
              set({ 
                user: null, 
                token: null, 
                isAuthenticated: false,
                error: error.message || 'Authentication failed'
              });
              // Clear localStorage
              localStorage.removeItem('auth-storage');
              throw new Error(error.message || 'Authentication failed');
            }
            throw new Error(error.message || 'Password change failed');
          }

          set({
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Password change failed',
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
