import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  User,
  History,
  Trash2,
  Plus,
  FileText,
  Move3D,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendChatMessage,
  getChatSessions,
  getSessionMessages,
  deleteChatSession,
  ChatMessage,
  ChatSession,
} from "../utils/api";
import { useAuthStore } from "../store/authStore";
import { useReportStore } from "../store/reportStore";

interface LekhakAIProps {
  reportContext?: string;
}

const LekhakAI: React.FC<LekhakAIProps> = ({ reportContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Resizable state
  const [dimensions, setDimensions] = useState({ width: 340, height: 600 }); // w-96 = 384px, h-[600px] = 600px
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { currentReport } = useReportStore();

  useEffect(() => {
    if (isOpen && user) {
      loadSessions();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const newWidth = Math.max(320, resizeStart.width + deltaX); // Minimum width 320px
      const newHeight = Math.max(400, resizeStart.height + deltaY); // Minimum height 400px

      setDimensions({
        width: Math.min(newWidth, window.innerWidth * 0.8), // Maximum width is 80% of window width
        height: Math.min(newHeight, window.innerHeight * 0.8), // Maximum height is 80% of window height
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "nw-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, resizeStart]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSessions = async () => {
    try {
      const sessionsList = await getChatSessions();
      setSessions(sessionsList);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const sessionMessages = await getSessionMessages(sessionId);
      setMessages(sessionMessages);
      setCurrentSessionId(sessionId);
      setShowHistory(false);
    } catch (error) {
      console.error("Failed to load session:", error);
      toast.error("Failed to load chat session");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      setSessions(sessions.filter((s) => s.sessionId !== sessionId));
      if (currentSessionId === sessionId) {
        startNewChat();
      }
      toast.success("Chat session deleted");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete chat session");
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const context = reportContext || currentReport?.id;
      const response = await sendChatMessage(
        userMessage.content,
        currentSessionId || undefined,
        context
      );

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCurrentSessionId(response.sessionId);

      // Reload sessions to update the list
      loadSessions();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-10 left-6 z-50 group">
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <img
            src="/LekhakAiLogo.jpg"
            alt="LekhakAi"
            className="w-16 h-16 object-contain rounded-full"
          />
        </motion.button>

        {/* Hover text below button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Ask lekhak.ai
          </div>
          {/* Arrow pointing up */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-1 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={chatRef}
        className="fixed bottom-6 left-6 z-50"
        initial={{ opacity: 0, height: "64px", width: "320px", y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          width: dimensions.width,
          height: isMinimized ? "64px" : dimensions.height,
        }}
        exit={{ opacity: 0, height: "64px", y: 20 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 400,
          height: { type: "spring", bounce: 0.2 },
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img
                  src="/LekhakAiLogo.jpg"
                  alt="LekhakAi"
                  className="w-14  h-14 object-contain rounded-full"
                />
                {/* <div className="relative -top-3  -right-11 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div> */}
              </div>
              <div>
                <h3 className="font-semibold text-sm">LekhakAi</h3>
                <p className="text-xs opacity-90">AI Assistant for Reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                title="Chat History"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={startNewChat}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Close"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Content Container with Animation */}
          {!isMinimized && (
            <motion.div
              className="flex-1 flex flex-col overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                height: { duration: 0.3, ease: "easeOut" },
                opacity: { duration: 0.2, delay: 0.1 },
              }}
            >
              {/* History Sidebar */}
              {showHistory && (
                <div className="border-b border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Recent Chats
                    </h4>
                    {sessions.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No chat history
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {sessions.map((session) => (
                          <div
                            key={session.sessionId}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer group"
                          >
                            <div
                              onClick={() => loadSession(session.sessionId)}
                              className="flex-1 min-w-0"
                            >
                              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                {session.lastMessage}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimestamp(session.lastTimestamp)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.sessionId);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-opacity"
                              title="Delete session"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Context Info */}
              {(reportContext || currentReport) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Context: {currentReport?.title || "Current Report"}
                    </span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0, y: 50, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      staggerChildren: 0.08,
                      height: { duration: 0.4, ease: "easeOut" },
                    }}
                  >
                    <motion.img
                      src="/LekhakAiLogo.jpg"
                      alt="LekhakAi"
                      className="w-16 h-16 mx-auto mb-3 object-contain rounded-full"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        damping: 12,
                        delay: 0.2,
                      }}
                    />
                    <motion.h4
                      className="font-medium text-gray-900 dark:text-gray-100 mb-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        delay: 0.4,
                      }}
                    >
                      Welcome to LekhakAi!
                    </motion.h4>
                    <motion.p
                      className="text-sm text-gray-600 dark:text-gray-400"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        delay: 0.5,
                      }}
                    >
                      I'm your AI assistant for report writing, content
                      suggestions, and any questions about your academic events.
                      Let's create amazing reports together!
                    </motion.p>
                  </motion.div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    initial={{ opacity: 0, y: 30, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                      delay: Math.min(0.1 * index, 0.3), // Cap stagger delay at 0.3s
                      height: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === "assistant" && (
                          <img
                            src="/LekhakAiLogo.jpg"
                            alt="LekhakAi"
                            className="w-6 h-6 mt-0.5 object-contain rounded-full"
                          />
                        )}
                        {message.role === "user" && (
                          <User className="w-4 h-4 mt-0.5 text-white" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className={`text-xs mt-1 opacity-70`}>
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      height: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <motion.img
                          src="/LekhakAiLogo.jpg"
                          alt="LekhakAi"
                          className="w-6 h-6 rounded-full object-contain"
                          animate={{ rotate: [0, 10, 0, -10, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut",
                          }}
                        />
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-purple-600 rounded-full"
                            animate={{ y: ["0%", "-50%", "0%"] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              ease: "easeInOut",
                            }}
                          ></motion.div>
                          <motion.div
                            className="w-2 h-2 bg-purple-600 rounded-full"
                            animate={{ y: ["0%", "-50%", "0%"] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              ease: "easeInOut",
                              delay: 0.2,
                            }}
                          ></motion.div>
                          <motion.div
                            className="w-2 h-2 bg-purple-600 rounded-full"
                            animate={{ y: ["0%", "-50%", "0%"] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              ease: "easeInOut",
                              delay: 0.4,
                            }}
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask LekhakAi anything..."
                      className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 min-h-[44px] max-h-[120px]"
                      rows={1}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Resize Handle */}
          {!isMinimized && (
            <motion.div
              className="absolute top-2 right-2 w-6 h-6 cursor-nw-resize opacity-70 hover:opacity-100 transition-all duration-200 z-20 bg-white/20 dark:bg-black/20 rounded backdrop-blur-sm"
              onMouseDown={handleResizeStart}
              title="Resize"
              whileHover={{ scale: 1.1, opacity: 1 }}
            >
              <Move3D className="w-6 h-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LekhakAI;
