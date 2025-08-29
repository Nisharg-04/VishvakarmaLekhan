import { EventReport } from '../store/reportStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// API utility class for making HTTP requests
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        
        // Handle authentication errors
        if (response.status === 401) {
          // Clear auth data and redirect to login if needed
          localStorage.removeItem('auth-storage');
          console.error('Authentication failed:', error.message || error.error);
        }
        
        // If there are validation details, include them in the error message
        if (error.details && Array.isArray(error.details)) {
          const validationErrors = error.details
            .map((detail: { field?: string; path?: string; message?: string; msg?: string }) => 
              `${detail.field || detail.path}: ${detail.message || detail.msg}`)
            .join(', ');
          throw new Error(`${error.error || 'Validation failed'}: ${validationErrors}`);
        }
        
        throw new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {}, // Don't set Content-Type for FormData
      body: formData,
    });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Export the API client instance
export { apiClient as api };

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  reports: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface FileUploadResponse {
  message: string;
  file: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: string;
  };
}

export interface MultipleFileUploadResponse {
  message: string;
  files: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
}

// Report API functions
export const fetchReports = async (
  page = 1,
  limit = 10,
  status?: string,
  search?: string
): Promise<PaginatedResponse<EventReport>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);
  if (search) params.append('search', search);

  return apiClient.get<PaginatedResponse<EventReport>>(`/reports?${params}`);
};

// Fetch a specific report by ID
export const fetchReportById = async (id: string): Promise<EventReport> => {
  return apiClient.get<EventReport>(`/reports/${id}`);
};

// Create a new report
export const createReport = async (reportData: Partial<EventReport>): Promise<EventReport> => {
  return apiClient.post<EventReport>('/reports', reportData);
};

// Update an existing report
export const updateReport = async (id: string, reportData: Partial<EventReport>): Promise<EventReport> => {
  return apiClient.put<EventReport>(`/reports/${id}`, reportData);
};

// Delete a report
export const deleteReport = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/reports/${id}`);
};

// Generate report content
export const generateReport = async (reportData: Partial<EventReport>): Promise<string> => {
  if (reportData.id) {
    const response = await apiClient.post<{ message: string; report: EventReport }>(`/reports/${reportData.id}/generate`);
    return response.report.generatedContent || '';
  }
  
  // If no ID, validate required fields and create report first
  const requiredFields = [
    'title', 'startDate', 'endDate', 'venue', 'eventType', 'organizedBy',
    'academicYear', 'semester', 'targetAudience', 'participantCount',
    'selectedLogos', 'facultyCoordinators', 'studentCoordinators'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = reportData[field as keyof EventReport];
    if (Array.isArray(value)) {
      return !value || value.length === 0;
    }
    return !value || (typeof value === 'string' && value.trim() === '');
  });
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Ensure dates are in ISO format
  const reportDataWithFormattedDates = {
    ...reportData,
    startDate: new Date(reportData.startDate!).toISOString(),
    endDate: new Date(reportData.endDate!).toISOString(),
  };
  
  // Create report first then generate
  const newReport = await createReport(reportDataWithFormattedDates);
  const response = await apiClient.post<{ message: string; report: EventReport }>(`/reports/${newReport.id}/generate`);
  return response.report.generatedContent || '';
};

// Save report as draft (create or update)
export const saveReportDraft = async (reportData: Partial<EventReport>): Promise<EventReport> => {
  if (reportData.id) {
    // Update existing report
    const updateData: Partial<EventReport> = {
      ...reportData,
      status: 'draft' as const // Ensure status is set to draft
    };
    
    // Format dates if they exist
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate).toISOString();
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate).toISOString();
    }
    
    return updateReport(reportData.id, updateData);
  } else {
    // Create new report - prepare data with defaults for required fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataWithoutId } = reportData as EventReport;
    
    // Set minimum required defaults to pass validation
    const draftData: Partial<EventReport> = {
      ...dataWithoutId,
      title: dataWithoutId.title || 'Untitled Report',
      startDate: dataWithoutId.startDate ? new Date(dataWithoutId.startDate).toISOString() : new Date().toISOString(),
      endDate: dataWithoutId.endDate ? new Date(dataWithoutId.endDate).toISOString() : new Date().toISOString(),
      venue: dataWithoutId.venue || 'TBD',
      eventType: dataWithoutId.eventType || 'Event',
      organizedBy: dataWithoutId.organizedBy || 'TBD',
      academicYear: dataWithoutId.academicYear || '2024-25',
      semester: dataWithoutId.semester || 'Sem 1',
      targetAudience: dataWithoutId.targetAudience || 'Students',
      participantCount: dataWithoutId.participantCount || 0,
      selectedLogos: dataWithoutId.selectedLogos?.length ? dataWithoutId.selectedLogos : ['bvm'],
      facultyCoordinators: dataWithoutId.facultyCoordinators?.length 
        ? dataWithoutId.facultyCoordinators 
        : [{ name: 'TBD', email: 'tbd@bvmengineering.ac.in', designation: 'Professor' }],
      studentCoordinators: dataWithoutId.studentCoordinators?.length 
        ? dataWithoutId.studentCoordinators 
        : [{ name: 'TBD', rollNo: 'TBD', contact: 'TBD' }],
      status: 'draft' as const
    };
    
    return createReport(draftData);
  }
};

// File upload functions
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.upload<FileUploadResponse>('/upload/single', formData);
};

export const uploadMultipleFiles = async (files: File[]): Promise<MultipleFileUploadResponse> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  return apiClient.upload<MultipleFileUploadResponse>('/upload/multiple', formData);
};

export const uploadAttendanceSheet = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('attendanceSheet', file);
  
  return apiClient.upload<FileUploadResponse>('/upload/attendance', formData);
};

export const uploadAttendanceSheets = async (files: File[]): Promise<MultipleFileUploadResponse> => {
  const formData = new FormData();
  files.forEach(file => formData.append('attendanceSheets', file));
  
  return apiClient.upload<MultipleFileUploadResponse>('/upload/attendance', formData);
};

export const uploadMiscellaneousFiles = async (files: File[]): Promise<MultipleFileUploadResponse> => {
  const formData = new FormData();
  files.forEach(file => formData.append('miscellaneousFiles', file));
  
  return apiClient.upload<MultipleFileUploadResponse>('/upload/miscellaneous', formData);
};

export const deleteUploadedFile = async (filename: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/upload/${filename}`);
};

// Health check
export const checkApiHealth = async (): Promise<{ status: string; message: string; timestamp: string }> => {
  return apiClient.get<{ status: string; message: string; timestamp: string }>('/health');
};

// Types for admin operations
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  department: string;
  designation?: string;
  contactNumber?: string;
  rollNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Admin API endpoints
export const getAllUsers = async (): Promise<{ users: User[] }> => {
  return apiClient.get<{ users: User[] }>('/auth/users');
};

export const updateUserRole = async (userId: string, role: string): Promise<{ message: string; user: User }> => {
  return apiClient.put<{ message: string; user: User }>(`/auth/users/${userId}/role`, { role });
};

export const deleteUser = async (userId: string): Promise<{ message: string; deletedUser: Partial<User> }> => {
  return apiClient.delete<{ message: string; deletedUser: Partial<User> }>(`/auth/admin/users/${userId}`);
};

export const searchUsers = async (query: string, filters?: { role?: string; department?: string; isActive?: boolean }): Promise<{ users: User[]; count: number }> => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.department) params.append('department', filters.department);
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  
  return apiClient.get<{ users: User[]; count: number }>(`/auth/admin/users/search?${params.toString()}`);
};

export const bulkUpdateUsers = async (action: string, userIds: string[]): Promise<{ message: string; skipped?: string }> => {
  return apiClient.post<{ message: string; skipped?: string }>('/auth/admin/users/bulk-action', {
    action,
    userIds
  });
};

export const resetUserPassword = async (userId: string, newPassword: string): Promise<{ message: string; user: User }> => {
  return apiClient.put<{ message: string; user: User }>(`/auth/admin/users/${userId}/reset-password`, {
    newPassword
  });
};

export const getUserStats = async (): Promise<{
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentUsers: number;
  inactiveUsers: number;
  usersWithLastLogin: number;
  recentlyActive: number;
}> => {
  return apiClient.get<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    recentUsers: number;
    inactiveUsers: number;
    usersWithLastLogin: number;
    recentlyActive: number;
  }>('/auth/admin/stats');
};

// AI Content Generation Functions
export interface AIContentContext {
  eventTitle?: string;
  eventType?: string;
  targetAudience?: string;
  existingContent?: string;
  additionalInfo?: string;
}

export const generateAIContentForBlock = async (blockType: string, context: AIContentContext): Promise<string> => {
  return apiClient.post<{ content: string }>('/reports/ai/generate-content', {
    blockType,
    context
  }).then(response => response.content);
};

export const generateAISummary = async (reportId: string): Promise<string> => {
  return apiClient.get<{ summary: string }>(`/reports/${reportId}/ai-summary`)
    .then(response => response.summary);
};

export const generateSummaryReport = async (reportData: Partial<EventReport>): Promise<string> => {
  return apiClient.post<{ content: string }>('/reports/generate-summary', reportData)
    .then(response => response.content);
};

export const generateAIRecommendations = async (reportId: string): Promise<string> => {
  return apiClient.get<{ recommendations: string }>(`/reports/${reportId}/ai-recommendations`)
    .then(response => response.recommendations);
};

export const testAIConnection = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ success: boolean }>('/reports/ai/test');
    return response.success;
  } catch {
    return false;
  }
};

// LekhakAI Chat Functions
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    reportContext?: string;
    responseTime?: number;
  };
}

export interface ChatSession {
  sessionId: string;
  lastMessage: string;
  lastTimestamp: Date;
  messageCount: number;
}

export const sendChatMessage = async (
  message: string, 
  sessionId?: string, 
  reportContext?: string
): Promise<{ response: string; sessionId: string }> => {
  return apiClient.post<{ response: string; sessionId: string }>('/lekhak-ai/chat', {
    message,
    sessionId,
    reportContext
  }).then(response => ({
    response: response.response,
    sessionId: response.sessionId
  }));
};

export const getChatSessions = async (): Promise<ChatSession[]> => {
  return apiClient.get<{ sessions: ChatSession[] }>('/lekhak-ai/sessions')
    .then(response => response.sessions);
};

export const getSessionMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  return apiClient.get<{ messages: ChatMessage[] }>(`/lekhak-ai/sessions/${sessionId}`)
    .then(response => response.messages);
};

export const deleteChatSession = async (sessionId: string): Promise<void> => {
  return apiClient.delete(`/lekhak-ai/sessions/${sessionId}`);
};

export const generateContentSuggestions = async (
  sectionType: string, 
  reportData: Partial<EventReport>
): Promise<string> => {
  return apiClient.post<{ suggestions: string }>('/lekhak-ai/content-suggestions', {
    sectionType,
    reportData
  }).then(response => response.suggestions);
};

export const testVishvakarmaAI = async (): Promise<{ message: string; testResponse: string }> => {
  return apiClient.get<{ message: string; testResponse: string }>('/lekhak-ai/test')
    .then(response => ({ message: response.message, testResponse: response.testResponse }));
};

// Admin-specific functions for downloading reports
export const getAdminReport = async (reportId: string): Promise<EventReport> => {
  return apiClient.get<{ report: EventReport }>(`/reports/admin/${reportId}`)
    .then(response => response.report);
};