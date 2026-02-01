"use client";

import { useState } from "react";
import { Upload, FileText, X, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ImportFromFileProps {
  onClose: () => void;
  onImport: (result: {
    flashcards?: Array<{ front: string; back: string }>;
    quizzes?: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  }) => void;
  type: "flashcards" | "quiz";
}

export default function ImportFromFile({
  onClose,
  onImport,
  type,
}: ImportFromFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
  };

  const parseFlashcardsFromCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const flashcards: Array<{ front: string; back: string }> = [];

    for (const line of lines) {
      // Support formats: "front,back" or "front|back" or "front\tback"
      const parts = line.split(/[,|\t]/).map((p) => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        flashcards.push({
          front: parts[0],
          back: parts[1],
        });
      }
    }

    return flashcards;
  };

  const parseQuizzesFromCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const quizzes: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }> = [];

    for (const line of lines) {
      // Format: question,option1,option2,option3,option4,correctAnswer(0-3)
      const parts = line.split(/[,|\t]/).map((p) => p.trim());

      if (parts.length >= 6) {
        const correctAnswer = parseInt(parts[5]);
        if (correctAnswer >= 0 && correctAnswer <= 3) {
          quizzes.push({
            question: parts[0],
            options: [parts[1], parts[2], parts[3], parts[4]],
            correctAnswer: correctAnswer,
          });
        }
      }
    }

    return quizzes;
  };

  const handleImport = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;

      try {
        if (type === "flashcards") {
          const flashcards = parseFlashcardsFromCSV(text);
          if (flashcards.length === 0) {
            setError("No valid flashcards found. Check file format.");
            return;
          }
          onImport({ flashcards });
        } else {
          const quizzes = parseQuizzesFromCSV(text);
          if (quizzes.length === 0) {
            setError("No valid quiz questions found. Check file format.");
            return;
          }
          onImport({ quizzes });
        }
      } catch (err) {
        setError("Error parsing file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    let content = "";
    let filename = "";

    if (type === "flashcards") {
      content = `What is React?,A JavaScript library for building user interfaces
What is a component?,Reusable piece of UI
What is JSX?,JavaScript XML syntax extension
What are props?,Properties passed to components`;
      filename = "flashcards_template.csv";
    } else {
      content = `What is React?,A JavaScript library,A CSS framework,A database,A web server,0
Which hook is used for state?,useState,useEffect,useContext,useReducer,0
What does JSX stand for?,JavaScript Extension,JavaScript XML,Java Syntax,JSON Extension,1
React was created by?,Google,Facebook,Twitter,Microsoft,1`;
      filename = "quiz_template.csv";
    }

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center !p-4">
      <Card className="w-full max-w-2xl">
        <div className="!p-6">
          {/* Header */}
          <div className="flex items-center justify-between !mb-6 !pb-4 border-b border-slate-700/50">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Upload className="text-purple-400" size={24} />
                Import from File
              </h2>
              <p className="text-sm text-slate-400 !mt-1">
                Upload a CSV file with pre-formatted{" "}
                {type === "flashcards" ? "flashcards" : "quiz questions"}
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
              htmlFor="import-file-upload"
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
                    <p className="text-xs text-slate-500">CSV, TXT files</p>
                  </>
                )}
              </div>
              <input
                id="import-file-upload"
                type="file"
                className="hidden"
                accept=".csv,.txt"
                onChange={handleFileChange}
              />
            </label>
            {error && <p className="text-sm text-red-400 !mt-2">{error}</p>}
          </div>

          {/* Format Info */}
          <div className="bg-slate-800/50 !p-4 rounded-lg !mb-4">
            <h3 className="text-sm font-semibold text-slate-200 !mb-3 flex items-center justify-between">
              File Format:
              <button
                onClick={downloadTemplate}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Download size={14} />
                Download Template
              </button>
            </h3>
            {type === "flashcards" ? (
              <div className="text-xs text-slate-400 space-y-2">
                <p className="font-medium text-slate-300">
                  Each line: Front,Back
                </p>
                <div className="bg-slate-900/50 !p-2 rounded font-mono">
                  What is React?,A JavaScript library
                  <br />
                  What is JSX?,JavaScript XML syntax
                  <br />
                  What are props?,Properties passed to components
                </div>
                <p className="!mt-2">Separators: comma (,) pipe (|) or tab</p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 space-y-2">
                <p className="font-medium text-slate-300">
                  Each line:
                  Question,Option1,Option2,Option3,Option4,CorrectAnswer(0-3)
                </p>
                <div className="bg-slate-900/50 !p-2 rounded font-mono text-xs">
                  What is React?,A library,A framework,A database,A server,0
                  <br />
                  Which hook for
                  state?,useState,useEffect,useContext,useReducer,0
                </div>
                <p className="!mt-2">
                  Correct answer: 0=Option1, 1=Option2, 2=Option3, 3=Option4
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file}>
              <Upload size={16} />
              Import {file ? `(${file.name})` : ""}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
