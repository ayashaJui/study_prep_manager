"use client";

import { useState } from "react";
import { Upload, FileText, Sparkles, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface GenerateFromFileProps {
  onClose: () => void;
  onGenerate: (result: {
    flashcards: Array<{ front: string; back: string }>;
    quizzes: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  }) => void;
  type: "flashcards" | "quiz" | "both";
}

export default function GenerateFromFile({
  onClose,
  onGenerate,
  type,
}: GenerateFromFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [content, setContent] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseContentToFlashcards = (text: string) => {
    const flashcards: Array<{ front: string; back: string }> = [];

    // Simple parsing: Look for Q&A patterns or headings with content
    const lines = text.split("\n").filter((line) => line.trim());

    // Pattern 1: Q: ... A: ...
    const qaPattern = /Q:\s*(.+?)\s*A:\s*(.+)/gi;
    let match;
    while ((match = qaPattern.exec(text)) !== null) {
      flashcards.push({
        front: match[1].trim(),
        back: match[2].trim(),
      });
    }

    // Pattern 2: Headings followed by content
    if (flashcards.length === 0) {
      const headingPattern = /^#+\s+(.+)$/gm;
      const headings: Array<{ title: string; index: number }> = [];

      while ((match = headingPattern.exec(text)) !== null) {
        headings.push({
          title: match[1],
          index: match.index,
        });
      }

      for (let i = 0; i < headings.length; i++) {
        const start = headings[i].index + headings[i].title.length;
        const end = headings[i + 1]?.index || text.length;
        const content = text.substring(start, end).trim();

        if (content.length > 10 && content.length < 500) {
          flashcards.push({
            front: headings[i].title,
            back: content,
          });
        }
      }
    }

    return flashcards.slice(0, 20); // Limit to 20 flashcards
  };

  const parseContentToQuiz = (text: string) => {
    const quizzes: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }> = [];

    // Generate simple quiz questions from headings/key points
    const lines = text.split("\n").filter((line) => line.trim());
    const headings = lines.filter(
      (line) => line.startsWith("#") || line.endsWith(":"),
    );

    headings.slice(0, 10).forEach((heading, idx) => {
      const cleanHeading = heading.replace(/^#+\s*/, "").replace(/:$/, "");

      quizzes.push({
        question: `What is ${cleanHeading}?`,
        options: [
          `Correct definition of ${cleanHeading}`,
          `Incorrect option 1`,
          `Incorrect option 2`,
          `Incorrect option 3`,
        ],
        correctAnswer: 0,
      });
    });

    return quizzes;
  };

  const handleGenerate = () => {
    if (!content) return;

    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      const result = {
        flashcards:
          type === "flashcards" || type === "both"
            ? parseContentToFlashcards(content)
            : [],
        quizzes:
          type === "quiz" || type === "both" ? parseContentToQuiz(content) : [],
      };

      setIsProcessing(false);
      onGenerate(result);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center !p-4">
      <Card className="w-full max-w-2xl">
        <div className="!p-6">
          {/* Header */}
          <div className="flex items-center justify-between !mb-6 !pb-4 border-b border-slate-700/50">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="text-purple-400" size={24} />
                Generate from File
              </h2>
              <p className="text-sm text-slate-400 !mt-1">
                Upload a document to auto-generate{" "}
                {type === "both"
                  ? "flashcards and quizzes"
                  : type === "flashcards"
                    ? "flashcards"
                    : "quiz questions"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="!p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* File Upload */}
          <div className="!mb-6">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center !pt-5 !pb-6">
                {file ? (
                  <>
                    <FileText className="text-purple-400 !mb-3" size={48} />
                    <p className="text-sm font-medium text-slate-300">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 !mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-400 !mb-3" size={48} />
                    <p className="!mb-2 text-sm text-slate-300">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      TXT, MD, PDF (Max 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".txt,.md,.pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Info */}
          <div className="bg-slate-800/50 !p-4 rounded-lg !mb-6">
            <h3 className="text-sm font-semibold text-slate-200 !mb-2">
              How it works:
            </h3>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>
                Upload your study material (notes, textbook excerpts, etc.)
              </li>
              <li>AI analyzes the content and key concepts</li>
              <li>
                Automatically generates{" "}
                {type === "both"
                  ? "flashcards and quiz questions"
                  : type === "flashcards"
                    ? "flashcards"
                    : "quiz questions"}
              </li>
              <li>Review and edit before saving</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={!file || isProcessing}>
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
