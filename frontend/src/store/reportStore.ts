import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import {
  fetchReports,
  fetchReportById,
  createReport,
  updateReport,
  deleteReport as deleteReportApi,
  saveReportDraft,
} from '../utils/api';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'quote' | 'achievement';
  title: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[]; // Support for multiple images
  imageLayout?: 'single' | 'grid' | 'row'; // Layout options for multiple images
  caption?: string;
  credit?: string;
}

export interface EventReport {
  customEventType?: string;
  id: string;
  title: string;
  tagline: string;
  selectedLogos: string[];
  startDate: string;
  endDate: string;
  venue: string;
  customVenue?: string;
  eventType: string;
  organizedBy: string;
  institute: string;
  academicYear: string;
  semester: string;
  targetAudience: string;
  participantCount: number;
  facultyCoordinators: Array<{
    name: string;
    email: string;
    designation: string;
  }>;
  facultyCoordinator: { // Keep for backward compatibility
    name: string;
    email: string;
    designation: string;
  };
  studentCoordinators: Array<{
    name: string;
    rollNo: string;
    contact: string;
  }>;
  chiefGuest: {
    name: string;
    designation: string;
    affiliation: string;
  };
  hostedBy: string;
  guestsOfHonor: string;
  specialMentions: string;
  contentBlocks: ContentBlock[];
  attendanceSheets?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>; // Support multiple attendance files
  attendanceSheet?: File | string; // Keep for backward compatibility
  miscellaneousFiles?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: string;
    description?: string;
  }>; // Support miscellaneous files
  generatedContent?: string;
  status: 'draft' | 'generated';
  createdAt: string;
  updatedAt: string;
}

interface ReportState {
  reports: EventReport[];
  currentReport: Partial<EventReport>;
  loading: boolean;
  error: string | null;
  
  // Report CRUD operations
  loadReports: (page?: number, limit?: number, status?: string, search?: string) => Promise<void>;
  loadReportById: (id: string) => Promise<void>;
  addReport: (report: Partial<EventReport>) => Promise<EventReport | null>;
  updateReportById: (id: string, report: Partial<EventReport>) => Promise<EventReport | null>;
  deleteReport: (id: string) => Promise<boolean>;
  saveDraft: (report: Partial<EventReport>) => Promise<EventReport | null>;
  
  // Local state management
  setCurrentReport: (report: Partial<EventReport>) => void;
  clearCurrentReport: () => void;
  getReportById: (id: string) => EventReport | undefined;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultReport: Partial<EventReport> = {
  institute: 'Birla Vishvakarma Mahavidyalaya Engineering College',
  organizedBy: '',
  selectedLogos: ['bvm'],
  contentBlocks: [],
  facultyCoordinators: [{ name: '', email: '', designation: '' }],
  studentCoordinators: [{ name: '', rollNo: '', contact: '' }],
  chiefGuest: { name: '', designation: '', affiliation: '' },
  status: 'draft',
};

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  currentReport: defaultReport,
  loading: false,
  error: null,

  // Load reports from backend with pagination and filtering
  loadReports: async (page = 1, limit = 10, status, search) => {
    set({ loading: true, error: null });
    try {
      const response = await fetchReports(page, limit, status, search);
      set({ 
        reports: response.reports,
        loading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reports';
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
    }
  },

  // Load a specific report by ID
  loadReportById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const report = await fetchReportById(id);
      set({ 
        currentReport: report,
        loading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load report';
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
    }
  },

  // Add new report
  addReport: async (reportData: Partial<EventReport>) => {
    set({ loading: true, error: null });
    try {
      const newReport = await createReport({
        ...reportData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      set((state) => ({
        reports: [newReport, ...state.reports],
        loading: false,
      }));
      
      toast.success('Report created successfully');
      return newReport;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create report';
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      return null;
    }
  },

  // Update existing report
  updateReportById: async (id: string, reportData: Partial<EventReport>) => {
    set({ loading: true, error: null });
    try {
      const updatedReport = await updateReport(id, {
        ...reportData,
        updatedAt: new Date().toISOString(),
      });
      
      set((state) => ({
        reports: state.reports.map((report) =>
          report.id === id ? updatedReport : report
        ),
        currentReport: state.currentReport.id === id ? updatedReport : state.currentReport,
        loading: false,
      }));
      
      toast.success('Report updated successfully');
      return updatedReport;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update report';
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      return null;
    }
  },

  // Delete report
  deleteReport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteReportApi(id);
      
      set((state) => ({
        reports: state.reports.filter((report) => report.id !== id),
        loading: false,
      }));
      
      toast.success('Report deleted successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete report';
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      return false;
    }
  },

  // Save draft (create or update based on whether report has ID)
  saveDraft: async (reportData: Partial<EventReport>) => {
    set({ loading: true, error: null });
    try {
      const savedReport = await saveReportDraft(reportData);
      
      set((state) => {
        const existingIndex = state.reports.findIndex(r => r.id === savedReport.id);
        const updatedReports = existingIndex >= 0
          ? state.reports.map(r => r.id === savedReport.id ? savedReport : r)
          : [savedReport, ...state.reports];

        return {
          reports: updatedReports,
          currentReport: savedReport,
          loading: false,
        };
      });
      
      toast.success('Draft saved successfully');
      return savedReport;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft';
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      return null;
    }
  },

  // Local state management methods
  setCurrentReport: (report) =>
    set((state) => ({
      currentReport: { ...state.currentReport, ...report },
    })),

  clearCurrentReport: () =>
    set(() => ({
      currentReport: defaultReport,
    })),

  getReportById: (id) => {
    const state = get();
    return state.reports.find((report) => report.id === id);
  },

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}));