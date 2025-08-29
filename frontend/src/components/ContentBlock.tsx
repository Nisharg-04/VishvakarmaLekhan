import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  GripVertical,
  Trash2,
  Image as ImageIcon,
  Type,
  Quote,
  Award,
  Upload,
  X,
  Sparkles,
  Grid,
  Rows,
  Columns,
} from "lucide-react";
import { ContentBlock as ContentBlockType } from "../store/reportStore";
import { generateAIContentForBlock, AIContentContext } from "../utils/api";

interface ContentBlockProps {
  block: ContentBlockType;
  onUpdate: (block: ContentBlockType) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
  eventContext?: {
    title?: string;
    eventType?: string;
    targetAudience?: string;
  };
}

const ContentBlock: React.FC<ContentBlockProps> = ({
  block,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  eventContext,
}) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    block.imageUrls || (block.imageUrl ? [block.imageUrl] : [])
  );
  const [imageLayout, setImageLayout] = useState<"single" | "grid" | "row">(
    block.imageLayout || "single"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleMultipleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImagePreviews((prev) => {
          const updated = [...prev, imageUrl];
          onUpdate({
            ...block,
            imageUrls: updated,
            imageUrl: updated[0], // Keep backward compatibility
          });
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onUpdate({
        ...block,
        imageUrls: updated,
        imageUrl: updated[0] || "",
      });
      return updated;
    });
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      // Prepare context for AI generation
      const context: AIContentContext = {
        eventTitle: eventContext?.title,
        eventType: eventContext?.eventType,
        targetAudience: eventContext?.targetAudience,
        existingContent: block.content,
        additionalInfo: block.title,
      };

      // Call the real AI API
      const aiContent = await generateAIContentForBlock(block.type, context);

      onUpdate({ ...block, content: aiContent });
    } catch (error) {
      console.error("AI generation failed:", error);
      // Fallback to original mock content if AI fails
      const fallbackContent = {
        text: `This section provides detailed information about ${
          block.title || eventContext?.title || "the event"
        }. The content covers key aspects, important details, and valuable insights that contribute to the overall understanding of the topic.`,
        quote: `"${
          eventContext?.title || "This event"
        } represents excellence in education and innovation, fostering growth and learning opportunities for all participants."`,
        achievement: `The ${
          block.title || "achievement"
        } demonstrates exceptional performance and dedication. This accomplishment showcases the commitment to excellence and successful execution of planned objectives.`,
        image: `This image captures a significant moment during ${
          eventContext?.title || "the event"
        }, showcasing active participation and engagement from attendees.`,
      };

      onUpdate({
        ...block,
        content:
          fallbackContent[block.type as keyof typeof fallbackContent] ||
          fallbackContent.text,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case "text":
        return <Type size={16} />;
      case "image":
        return <ImageIcon size={16} />;
      case "quote":
        return <Quote size={16} />;
      case "achievement":
        return <Award size={16} />;
      default:
        return <Type size={16} />;
    }
  };

  const getBlockTitle = () => {
    switch (block.type) {
      case "text":
        return "Text Section";
      case "image":
        return "Image Block";
      case "quote":
        return "Quote Block";
      case "achievement":
        return "Achievement Highlight";
      default:
        return "Content Block";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
      draggable
      onDragStart={(e) => onDragStart?.(e, block.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, block.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-400">
            {getBlockIcon()}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {getBlockTitle()}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab"
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200"
            title="Delete this block"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Title Input - Optional for image blocks */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Section Title {block.type === "image" ? "(Optional)" : ""}
          </label>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onUpdate({ ...block, title: e.target.value })}
            placeholder={
              block.type === "image"
                ? "Enter section title (optional)..."
                : "Enter section title..."
            }
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Multi-Image Upload for Image Block */}
        {block.type === "image" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload Images
            </label>

            {/* Layout Options */}
            {imagePreviews.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Image Layout
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageLayout("single");
                      onUpdate({ ...block, imageLayout: "single" });
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                      imageLayout === "single"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                    title="Single image display"
                  >
                    <ImageIcon size={14} />
                    <span>Single</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageLayout("row");
                      onUpdate({ ...block, imageLayout: "row" });
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                      imageLayout === "row"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                    title="Images in a row"
                  >
                    <Rows size={14} />
                    <span>Row</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageLayout("grid");
                      onUpdate({ ...block, imageLayout: "grid" });
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                      imageLayout === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                    title="Images in a grid"
                  >
                    <Grid size={14} />
                    <span>Grid</span>
                  </button>
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
              {imagePreviews.length > 0 ? (
                <div className="space-y-4">
                  <div
                    className={`grid gap-3 ${
                      imageLayout === "grid" && imagePreviews.length > 1
                        ? "grid-cols-2"
                        : imageLayout === "row" && imagePreviews.length > 1
                        ? "grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <label className="flex items-center justify-center cursor-pointer p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200">
                    <Upload size={16} className="text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Add more images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={32} className="text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Click to upload images
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    Select multiple images for advanced layouts
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Caption for Image Block */}
        {block.type === "image" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Caption
            </label>
            <input
              type="text"
              value={block.caption || ""}
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              placeholder="Enter image caption..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        )}

        {/* Content Textarea with AI Generation - Optional for image blocks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {block.type === "quote"
                ? "Quote Text"
                : block.type === "image"
                ? "Content (Optional)"
                : "Content"}
            </label>
            <button
              type="button"
              onClick={generateAIContent}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200"
              title="Generate content with AI"
            >
              <Sparkles
                size={12}
                className={isGenerating ? "animate-spin" : ""}
              />
              <span>{isGenerating ? "Generating..." : "AI Generate"}</span>
            </button>
          </div>
          <textarea
            value={block.content}
            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
            placeholder={
              block.type === "quote"
                ? "Enter the quote..."
                : block.type === "achievement"
                ? "Describe the achievement..."
                : block.type === "image"
                ? "Enter content description (optional)..."
                : "Enter content..."
            }
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        {/* Credit for Image Block */}
        {block.type === "image" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Photo Credit (Optional)
            </label>
            <input
              type="text"
              value={block.credit || ""}
              onChange={(e) => onUpdate({ ...block, credit: e.target.value })}
              placeholder="Photo by..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ContentBlock;
