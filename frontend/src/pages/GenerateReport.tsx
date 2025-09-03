import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { toast } from "react-hot-toast";
import {
  Plus,
  Type,
  Image as ImageIcon,
  Quote,
  Award,
  Loader2,
  Download,
  Eye,
  Save,
  Sparkles,
  EyeOff,
  Upload,
  FileText,
  Users,
} from "lucide-react";
import {
  useReportStore,
  EventReport,
  ContentBlock,
} from "../store/reportStore";
import ContentBlockComponent from "../components/ContentBlock";
import ReportPreview from "../components/ReportPreview";
import LogoSelector from "../components/LogoSelector";
import { generateReport } from "../utils/api";
import { generateSummaryReport } from "../utils/api";
import { downloadReportAsDocx } from "../utils/downloadDocx";
import { generateExactHtmlReplicaDocx } from "../utils/htmlToDocx";
import "react-datepicker/dist/react-datepicker.css";

const GenerateReport: React.FC = () => {
  const { currentReport, setCurrentReport } = useReportStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingSummary, setIsDownloadingSummary] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // Changed default to false
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [miscellaneousFiles, setMiscellaneousFiles] = useState<File[]>([]);
  const [attendanceSheets, setAttendanceSheets] = useState<File[]>([]);
  const [attendanceSheet, setAttendanceSheet] = useState<File | null>(null); // Keep for backward compatibility

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: currentReport,
    mode: "onChange",
  });

  // Register date fields for validation
  useEffect(() => {
    register("startDate", { required: "Start date is required" });
    register("endDate", { required: "End date is required" });
  }, [register]);

  const watchedValues = watch();

  // Initialize with BVM logo selected by default if no logos are selected
  useEffect(() => {
    if (
      !currentReport.selectedLogos ||
      currentReport.selectedLogos.length === 0
    ) {
      const initialReport = { ...currentReport, selectedLogos: ["bvm"] };
      setCurrentReport(initialReport);
      setValue("selectedLogos", ["bvm"]);
    }
  }, [currentReport.selectedLogos, currentReport, setCurrentReport, setValue]); // Updated dependencies

  // Auto-save functionality with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchedValues) {
        setCurrentReport(watchedValues);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedValues, setCurrentReport]);

  // Close floating menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById("floating-menu");
      const button = event.target as Element;

      if (
        menu &&
        !menu.contains(button) &&
        !button.closest("[data-floating-button]")
      ) {
        menu.classList.add("hidden");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const blockTypes = [
    { type: "text", icon: Type, label: "Text Section" },
    { type: "image", icon: ImageIcon, label: "Image Block" },
    { type: "quote", icon: Quote, label: "Quote Block" },
    { type: "achievement", icon: Award, label: "Achievement" },
  ];

  const addContentBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      title: "",
      content: "",
    };

    const updatedBlocks = [...(currentReport.contentBlocks || []), newBlock];
    const updatedReport = { ...currentReport, contentBlocks: updatedBlocks };
    setCurrentReport(updatedReport);

    // Also update the form value to keep them in sync
    setValue("contentBlocks", updatedBlocks);
  };

  const updateContentBlock = (updatedBlock: ContentBlock) => {
    const updatedBlocks = (currentReport.contentBlocks || []).map((block) =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    const updatedReport = { ...currentReport, contentBlocks: updatedBlocks };
    setCurrentReport(updatedReport);

    // Also update the form value to keep them in sync
    setValue("contentBlocks", updatedBlocks);
  };

  const deleteContentBlock = (blockId: string) => {
    const updatedBlocks = (currentReport.contentBlocks || []).filter(
      (block) => block.id !== blockId
    );
    const updatedReport = { ...currentReport, contentBlocks: updatedBlocks };
    setCurrentReport(updatedReport);

    // Also update the form value to keep them in sync
    setValue("contentBlocks", updatedBlocks);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();

    if (!draggedBlockId || draggedBlockId === targetBlockId) return;

    const blocks = [...(currentReport.contentBlocks || [])];
    const draggedIndex = blocks.findIndex(
      (block) => block.id === draggedBlockId
    );
    const targetIndex = blocks.findIndex((block) => block.id === targetBlockId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedBlock] = blocks.splice(draggedIndex, 1);
    blocks.splice(targetIndex, 0, draggedBlock);

    const updatedReport = { ...currentReport, contentBlocks: blocks };
    setCurrentReport(updatedReport);
    setValue("contentBlocks", blocks);
    setDraggedBlockId(null);
  };

  const addStudentCoordinator = () => {
    const coordinators = currentReport.studentCoordinators || [];
    const updatedCoordinators = [
      ...coordinators,
      { name: "", rollNo: "", contact: "" },
    ];
    const updatedReport = {
      ...currentReport,
      studentCoordinators: updatedCoordinators,
    };
    setCurrentReport(updatedReport);
    setValue("studentCoordinators", updatedCoordinators);
  };

  const addFacultyCoordinator = () => {
    const coordinators = currentReport.facultyCoordinators || [];
    const updatedCoordinators = [
      ...coordinators,
      { name: "", email: "", designation: "" },
    ];
    const updatedReport = {
      ...currentReport,
      facultyCoordinators: updatedCoordinators,
    };
    setCurrentReport(updatedReport);
    setValue("facultyCoordinators", updatedCoordinators);
  };

  const updateStudentCoordinator = (
    index: number,
    field: string,
    value: string
  ) => {
    const coordinators = [...(currentReport.studentCoordinators || [])];
    coordinators[index] = { ...coordinators[index], [field]: value };
    const updatedReport = {
      ...currentReport,
      studentCoordinators: coordinators,
    };
    setCurrentReport(updatedReport);
    setValue("studentCoordinators", coordinators);
  };

  const updateFacultyCoordinator = (
    index: number,
    field: string,
    value: string
  ) => {
    const coordinators = [...(currentReport.facultyCoordinators || [])];
    coordinators[index] = { ...coordinators[index], [field]: value };
    const updatedReport = {
      ...currentReport,
      facultyCoordinators: coordinators,
    };
    setCurrentReport(updatedReport);
    setValue("facultyCoordinators", coordinators);
  };

  const removeStudentCoordinator = (index: number) => {
    const coordinators = currentReport.studentCoordinators || [];
    if (coordinators.length > 1) {
      const updatedCoordinators = coordinators.filter((_, i) => i !== index);
      const updatedReport = {
        ...currentReport,
        studentCoordinators: updatedCoordinators,
      };
      setCurrentReport(updatedReport);
      setValue("studentCoordinators", updatedCoordinators);
    }
  };

  const removeFacultyCoordinator = (index: number) => {
    const coordinators = currentReport.facultyCoordinators || [];
    if (coordinators.length > 1) {
      const updatedCoordinators = coordinators.filter((_, i) => i !== index);
      const updatedReport = {
        ...currentReport,
        facultyCoordinators: updatedCoordinators,
      };
      setCurrentReport(updatedReport);
      setValue("facultyCoordinators", updatedCoordinators);
    }
  };

  // File upload handlers
  const handleAttendanceSheetsUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      // For now, we'll store files locally and handle them during report generation
      // In a production app, you might want to upload to server immediately
      setAttendanceSheets((prev) => [...prev, ...files]);

      // For backward compatibility, set the first file as the main attendance sheet
      if (!attendanceSheet && files.length > 0) {
        setAttendanceSheet(files[0]);
      }

      toast.success(`${files.length} attendance file(s) added successfully!`);
    } catch (error) {
      console.error("Error handling attendance files:", error);
      toast.error("Failed to add attendance files");
    }
  };

  const handleMiscellaneousFilesUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setMiscellaneousFiles((prev) => [...prev, ...files]);
      toast.success(
        `${files.length} miscellaneous file(s) added successfully!`
      );
    } catch (error) {
      console.error("Error handling miscellaneous files:", error);
      toast.error("Failed to add miscellaneous files");
    }
  };

  const removeAttendanceSheet = (index: number) => {
    setAttendanceSheets((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Update main attendance sheet if needed
      const removedFile = prev[index];
      if (attendanceSheet === removedFile) {
        setAttendanceSheet(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  };

  const removeMiscellaneousFile = (index: number) => {
    setMiscellaneousFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogoToggle = (logoId: string) => {
    const currentLogos = currentReport.selectedLogos || [];
    const updatedLogos = currentLogos.includes(logoId)
      ? currentLogos.filter((id) => id !== logoId)
      : [...currentLogos, logoId];

    // Update the current report state
    const updatedReport = { ...currentReport, selectedLogos: updatedLogos };
    setCurrentReport(updatedReport);

    // Also update the form value to keep them in sync
    setValue("selectedLogos", updatedLogos);
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsGenerating(true);

      // Prepare the report data with all necessary fields
      const reportData = {
        ...data,
        contentBlocks: currentReport.contentBlocks || [],
        // Ensure required fields have proper defaults
        title: (data.title as string) || "Untitled Report",
        startDate: (data.startDate as string) || new Date().toISOString(),
        endDate: (data.endDate as string) || new Date().toISOString(),
        venue: (data.venue as string) || "TBD",
        eventType: (data.eventType as string) || "Event",
        organizedBy: (data.organizedBy as string) || "TBD",
        academicYear: (data.academicYear as string) || "2024-25",
        semester: (data.semester as string) || "Odd Semester",
        targetAudience: (data.targetAudience as string) || "Students",
        participantCount: (data.participantCount as number) || 0,
        selectedLogos:
          Array.isArray(data.selectedLogos) && data.selectedLogos.length
            ? data.selectedLogos
            : ["bvm"],
        facultyCoordinators:
          Array.isArray(data.facultyCoordinators) &&
          data.facultyCoordinators.length
            ? data.facultyCoordinators.filter(
                (coord: {
                  name?: string;
                  email?: string;
                  designation?: string;
                }) => coord.name?.trim()
              )
            : [
                {
                  name: "TBD",
                  email: "tbd@bvmengineering.ac.in",
                  designation: "Professor",
                },
              ],
        studentCoordinators:
          Array.isArray(data.studentCoordinators) &&
          data.studentCoordinators.length
            ? data.studentCoordinators.filter(
                (coord: { name?: string; rollNo?: string; contact?: string }) =>
                  coord.name?.trim()
              )
            : [{ name: "TBD", rollNo: "TBD", contact: "TBD" }],
        institute:
          (data.institute as string) ||
          "Birla Vishvakarma Mahavidyalaya Engineering College",
      };

      // Generate the report using the API
      const generatedContent = await generateReport(reportData);

      // Update the current report with the generated content
      setCurrentReport({
        ...reportData,
        generatedContent,
        status: "generated" as const,
      });

      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate report. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (currentReport.generatedContent) {
      // Use customVenue if venue is 'Custom'
      const venueValue =
        currentReport.venue === "Custom" && currentReport.customVenue
          ? currentReport.customVenue
          : currentReport.venue;
      // Use customEventType if eventType is 'Custom'
      const eventTypeValue =
        currentReport.eventType === "Custom" && currentReport.customEventType
          ? currentReport.customEventType
          : currentReport.eventType;
      const reportData = {
        ...currentReport,
        venue: venueValue,
        eventType: eventTypeValue,
        id: currentReport.id || Date.now().toString(),
        attendanceSheet: attendanceSheet, // Keep for backward compatibility
        attendanceSheets: attendanceSheets.map((file) => ({
          filename: file.name,
          originalName: file.name,
          mimetype: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
        })),
        miscellaneousFiles: miscellaneousFiles.map((file) => ({
          filename: file.name,
          originalName: file.name,
          mimetype: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
        })),
        status: "generated" as const,
        createdAt: currentReport.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as EventReport;

      generateExactHtmlReplicaDocx(
        reportData,
        attendanceSheet,
        attendanceSheets,
        miscellaneousFiles
      );

      // Show success message
      const totalFiles = attendanceSheets.length + miscellaneousFiles.length;
      if (totalFiles > 0) {
        const attendanceMsg =
          attendanceSheets.length > 0
            ? `${attendanceSheets.length} attendance file(s) embedded`
            : "";
        const miscMsg =
          miscellaneousFiles.length > 0
            ? `${miscellaneousFiles.length} miscellaneous file(s) embedded`
            : "";
        const combinedMsg = [attendanceMsg, miscMsg]
          .filter(Boolean)
          .join(" and ");

        toast.success(
          `Report downloaded successfully! (${combinedMsg} in document)`
        );
      } else {
        toast.success("Report downloaded successfully!");
      }
    }
  };

  const handleSummaryDownload = async () => {
    try {
      setIsDownloadingSummary(true);

      // Generate summary report content
      const summaryContent = await generateSummaryReport(currentReport);

      // Create summary report data without content blocks
      // Use customVenue if venue is 'Custom'
      const venueValue =
        currentReport.venue === "Custom" && currentReport.customVenue
          ? currentReport.customVenue
          : currentReport.venue;
      // Use customEventType if eventType is 'Custom'
      const eventTypeValue =
        currentReport.eventType === "Custom" && currentReport.customEventType
          ? currentReport.customEventType
          : currentReport.eventType;
      const summaryReportData = {
        ...currentReport,
        venue: venueValue,
        eventType: eventTypeValue,
        generatedContent: summaryContent,
        id: currentReport.id || Date.now().toString(),
        contentBlocks: [], // No content blocks in summary
        attendanceSheets: [],
        miscellaneousFiles: [],
      } as EventReport;

      // Download the summary report with custom filename
      await downloadReportAsDocx(
        summaryReportData,
        `${currentReport.title || "Event"}_Summary`
      );

      toast.success("Summary report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading summary:", error);
      toast.error("Failed to generate summary report. Please try again.");
    } finally {
      setIsDownloadingSummary(false);
    }
  };

  const saveDraft = () => {
    toast.success("Draft saved successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Generate Event Report
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Create comprehensive and professional event reports for Birla
            Vishvakarma Mahavidyalaya Engineering College
          </p>
        </div>

        <div
          className={`grid grid-cols-1 ${
            showPreview ? "lg:grid-cols-2" : ""
          } gap-8`}
        >
          {/* Form Section */}
          <div className="space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Logo Selection */}
              <LogoSelector
                selectedLogos={currentReport.selectedLogos || []}
                onLogoToggle={handleLogoToggle}
              />

              {/* General Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                  General Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Event Title *
                    </label>
                    <input
                      {...register("title", {
                        required: "Event title is required",
                      })}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter event title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Event Tagline
                    </label>
                    <input
                      {...register("tagline")}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter event tagline"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start Date *
                    </label>
                    <DatePicker
                      selected={
                        currentReport.startDate
                          ? new Date(currentReport.startDate)
                          : null
                      }
                      onChange={(date) => {
                        const dateString = date?.toISOString() || "";
                        setValue("startDate", dateString);
                        setCurrentReport({ startDate: dateString });
                      }}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholderText="Select start date"
                      dateFormat="dd/MM/yyyy"
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      End Date *
                    </label>
                    <DatePicker
                      selected={
                        currentReport.endDate
                          ? new Date(currentReport.endDate)
                          : null
                      }
                      onChange={(date) => {
                        const dateString = date?.toISOString() || "";
                        setValue("endDate", dateString);
                        setCurrentReport({ endDate: dateString });
                      }}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholderText="Select end date"
                      dateFormat="dd/MM/yyyy"
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Venue *
                    </label>
                    <select
                      {...register("venue", { required: "Venue is required" })}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => {
                        setValue("venue", e.target.value);
                        if (e.target.value !== "Custom")
                          setValue("customVenue", "");
                      }}
                      value={watch("venue")}
                    >
                      <option value="">Select venue</option>
                      <option value="Auditorium">Auditorium</option>
                      <option value="Seminar Hall">Seminar Hall</option>
                      <option value="Conference Room">Conference Room</option>
                      <option value="Online - Google Meet">
                        Online - Google Meet
                      </option>
                      <option value="Online - Zoom">Online - Zoom</option>
                      <option value="Online - Microsoft Teams">
                        Online - Microsoft Teams
                      </option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Custom">Custom (Type Venue)</option>
                    </select>
                    {watch("venue") === "Custom" && (
                      <input
                        {...register("customVenue", {
                          required: "Please type the venue",
                        })}
                        className="w-full mt-2 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Type venue, e.g., Classroom A-222"
                      />
                    )}
                    {errors.venue && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.venue.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Event Type *
                    </label>
                    <select
                      {...register("eventType", {
                        required: "Event type is required",
                      })}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => {
                        setValue("eventType", e.target.value);
                        if (e.target.value !== "Custom")
                          setValue("customEventType", "");
                      }}
                      value={watch("eventType")}
                    >
                      <option value="">Select event type</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="FDP">Faculty Development Program</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Conference">Conference</option>
                      <option value="Competition">Competition</option>
                      <option value="Custom">Custom (Type Event Type)</option>
                    </select>
                    {watch("eventType") === "Custom" && (
                      <input
                        {...register("customEventType", {
                          required: "Please type the event type",
                        })}
                        className="w-full mt-2 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Type event type, e.g., Alumni Meet"
                      />
                    )}
                    {errors.eventType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.eventType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Organized By *
                    </label>
                    <input
                      {...register("organizedBy", {
                        required: "Organizing department is required",
                      })}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Department name"
                    />
                    {errors.organizedBy && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.organizedBy.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Target Audience *
                    </label>
                    <select
                      {...register("targetAudience", {
                        required: "Target audience is required",
                      })}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select audience</option>
                      <option value="Students">Students</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Students & Faculty">
                        Students & Faculty
                      </option>
                      <option value="External Participants">
                        External Participants
                      </option>
                      <option value="All">All</option>
                    </select>
                    {errors.targetAudience && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.targetAudience.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Number of Participants *
                    </label>
                    <input
                      {...register("participantCount", {
                        valueAsNumber: true,
                        required: "Participant count is required",
                        min: {
                          value: 0,
                          message: "Participant count must be positive",
                        },
                      })}
                      type="number"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter participant count"
                    />
                    {errors.participantCount && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.participantCount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Academic Year *
                    </label>
                    <input
                      {...register("academicYear", {
                        required: "Academic year is required",
                      })}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., 2024-25"
                    />
                    {errors.academicYear && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.academicYear.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Semester *
                    </label>
                    <select
                      {...register("semester", {
                        required: "Semester is required",
                      })}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select semester</option>
                      <option value="Odd Semester">Odd Semester</option>
                      <option value="Even Semester">Even Semester</option>
                    </select>
                    {errors.semester && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.semester.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* People Involved */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                  People Involved
                </h2>

                {/* Faculty Coordinators */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                      Faculty Coordinators
                    </h3>
                    <button
                      type="button"
                      onClick={addFacultyCoordinator}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      Add More
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(
                      currentReport.facultyCoordinators || [
                        { name: "", email: "", designation: "" },
                      ]
                    ).map((coordinator, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-4 gap-3"
                      >
                        <input
                          value={coordinator.name}
                          onChange={(e) =>
                            updateFacultyCoordinator(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Name"
                        />
                        <input
                          value={coordinator.email}
                          onChange={(e) =>
                            updateFacultyCoordinator(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          type="email"
                          className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Email"
                        />
                        <input
                          value={coordinator.designation}
                          onChange={(e) =>
                            updateFacultyCoordinator(
                              index,
                              "designation",
                              e.target.value
                            )
                          }
                          className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Designation"
                        />
                        {(currentReport.facultyCoordinators?.length || 0) >
                          1 && (
                          <button
                            type="button"
                            onClick={() => removeFacultyCoordinator(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Coordinators */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                      Student Coordinators
                    </h3>
                    <button
                      type="button"
                      onClick={addStudentCoordinator}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      Add More
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(
                      currentReport.studentCoordinators || [
                        { name: "", rollNo: "", contact: "" },
                      ]
                    ).map((coordinator, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-4 gap-3"
                      >
                        <input
                          value={coordinator.name}
                          onChange={(e) =>
                            updateStudentCoordinator(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Name"
                        />
                        <input
                          value={coordinator.rollNo}
                          onChange={(e) =>
                            updateStudentCoordinator(
                              index,
                              "rollNo",
                              e.target.value
                            )
                          }
                          className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Roll No"
                        />
                        <input
                          value={coordinator.contact}
                          onChange={(e) =>
                            updateStudentCoordinator(
                              index,
                              "contact",
                              e.target.value
                            )
                          }
                          className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Contact"
                        />
                        {(currentReport.studentCoordinators?.length || 0) >
                          1 && (
                          <button
                            type="button"
                            onClick={() => removeStudentCoordinator(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chief Guest */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                    Chief Guest / Speaker
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      {...register("chiefGuest.name")}
                      className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Name"
                    />
                    <input
                      {...register("chiefGuest.designation")}
                      className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Designation"
                    />
                    <input
                      {...register("chiefGuest.affiliation")}
                      className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Affiliation"
                    />
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Hosted By / Anchors
                    </label>
                    <input
                      {...register("hostedBy")}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Host names"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Guests of Honor
                    </label>
                    <input
                      {...register("guestsOfHonor")}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Guest names"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Special Mentions
                  </label>
                  <textarea
                    {...register("specialMentions")}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                    placeholder="Any special mentions or acknowledgments"
                  />
                </div>
              </motion.div>

              {/* Dynamic Content Blocks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Event Content Blocks
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use the floating button to add content blocks
                  </p>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {(currentReport.contentBlocks || []).map((block) => (
                      <ContentBlockComponent
                        key={block.id}
                        block={block}
                        onUpdate={updateContentBlock}
                        onDelete={deleteContentBlock}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        eventContext={{
                          title: currentReport.title,
                          eventType: currentReport.eventType,
                          targetAudience: currentReport.targetAudience,
                        }}
                      />
                    ))}
                  </AnimatePresence>

                  {(!currentReport.contentBlocks ||
                    currentReport.contentBlocks.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
                      <Plus className="mx-auto text-slate-400 mb-4" size={48} />
                      <p className="text-slate-500 dark:text-slate-400 mb-4">
                        No content blocks added yet
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        Use the floating add button to start adding content
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Floating Buttons */}
              <div className="fixed bottom-6 right-6 z-50">
                <div className="flex flex-col space-y-3">
                  {/* Floating Preview Toggle Button */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center group ${
                        showPreview
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
                      }`}
                      title={showPreview ? "Hide Preview" : "Show Preview"}
                    >
                      {showPreview ? (
                        <EyeOff
                          size={24}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                      ) : (
                        <Eye
                          size={24}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                      )}
                    </button>
                  </div>

                  {/* Floating Add Block Button */}
                  <div className="relative group">
                    {/* Main floating button */}
                    <button
                      type="button"
                      data-floating-button="true"
                      className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-200 flex items-center justify-center group"
                      title="Add content block"
                      onClick={() => {
                        const menu = document.getElementById("floating-menu");
                        menu?.classList.toggle("hidden");
                      }}
                    >
                      <Plus
                        size={24}
                        className="group-hover:rotate-45 transition-transform duration-200"
                      />
                    </button>

                    {/* Floating menu */}
                    <div
                      id="floating-menu"
                      className="hidden absolute bottom-16 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-48"
                    >
                      {blockTypes.map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            addContentBlock(type as ContentBlock["type"]);
                            document
                              .getElementById("floating-menu")
                              ?.classList.add("hidden");
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 text-left"
                        >
                          <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400">
                            <Icon size={16} />
                          </div>
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Uploads Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                  Additional Files
                </h2>

                {/* Attendance Sheet Upload */}
                <div className="space-y-4">
                  <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users
                        className="text-blue-600 dark:text-blue-400"
                        size={20}
                      />
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        Attendance Sheet
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Upload attendance sheet images for the event (JPG, PNG,
                      GIF formats only)
                    </p>
                    <div className="space-y-3">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.gif,.webp"
                          className="sr-only"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            // Filter only image files
                            const imageFiles = files.filter((file) => {
                              const extension = file.name
                                .split(".")
                                .pop()
                                ?.toLowerCase();
                              return [
                                "jpg",
                                "jpeg",
                                "png",
                                "gif",
                                "webp",
                              ].includes(extension || "");
                            });
                            if (imageFiles.length > 0) {
                              handleAttendanceSheetsUpload(imageFiles);
                            }
                            if (imageFiles.length < files.length) {
                              toast.error(
                                "Only image files (JPG, PNG, GIF, WEBP) are allowed for attendance sheets"
                              );
                            }
                          }}
                        />
                        <div className="flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200">
                          <Upload className="mr-2" size={16} />
                          <span className="text-sm">Add Attendance Images</span>
                        </div>
                      </label>

                      {attendanceSheets.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {attendanceSheets.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded"
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                <FileText
                                  className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                                  size={14}
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                                  {file.name}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  ({(file.size / 1024).toFixed(1)}KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttendanceSheet(index)}
                                className="text-red-500 hover:text-red-700 text-xs ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {attendanceSheets.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                            📋 {attendanceSheets.length} attendance image(s)
                            ready to include in report
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Miscellaneous Files Upload */}
                  <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText
                        className="text-purple-600 dark:text-purple-400"
                        size={20}
                      />
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        Miscellaneous Files
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Upload additional files related to the event. These will
                      be embedded in the final report (images displayed,
                      documents extracted, presentations referenced)
                    </p>
                    <div className="space-y-3">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          className="sr-only"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            handleMiscellaneousFilesUpload(files);
                          }}
                        />
                        <div className="flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200">
                          <Upload className="mr-2" size={16} />
                          <span className="text-sm">Add Files</span>
                        </div>
                      </label>

                      {miscellaneousFiles.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {miscellaneousFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded"
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                <FileText
                                  className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                                  size={14}
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                                  {file.name}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  ({(file.size / 1024).toFixed(1)}KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMiscellaneousFile(index)}
                                className="text-red-500 hover:text-red-700 text-xs ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {miscellaneousFiles.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                            📎 {miscellaneousFiles.length} file(s) ready to
                            embed in report
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload Guidelines */}
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📋 Upload Guidelines:
                      </h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>
                          • Attendance sheet: Images only (jpg, png, gif, webp)
                          - will be displayed in the report
                        </li>
                        <li>
                          • Miscellaneous files: All file types including
                          presentations (.ppt, .pptx), documents (.doc, .docx),
                          certificates, photos
                        </li>
                        <li>• Maximum file size: 10MB per file</li>
                        <li>
                          • Multiple attendance images supported - will be
                          embedded under a single "Attendance Sheet" section
                        </li>
                        <li>
                          • Miscellaneous files will be embedded in the report
                          with their content (images displayed, documents
                          extracted, etc.)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI Generation Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                    <Sparkles className="text-white" size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      AI-Powered Report Generation
                    </h4>
                    <p className="text-sm text-gray-600">
                      Your report will be generated using advanced AI technology
                      to create comprehensive, professional content based on
                      your event details.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex items-center justify-center px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
                >
                  <Save className="mr-2" size={20} />
                  Save Draft
                </button>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={20} />
                      Generate Report
                    </>
                  )}
                </button>

                {currentReport.generatedContent && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Download className="mr-2" size={20} />
                      Download Full Report
                    </button>

                    <button
                      type="button"
                      onClick={handleSummaryDownload}
                      disabled={isDownloadingSummary}
                      className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloadingSummary ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={20} />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2" size={20} />
                          Download Summary
                        </>
                      )}
                    </button>
                  </>
                )}
              </motion.div>
            </form>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Live Preview
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  See how your report will look
                </p>
              </div>

              <div className="max-h-[80vh] overflow-y-auto">
                <ReportPreview report={currentReport} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateReport;
