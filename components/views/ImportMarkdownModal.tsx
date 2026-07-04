"use client";

import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { deriveNoteTitle } from "@/lib/noteUtils";

interface ParsedNote {
  content: string;
  tags: string[];
}

interface ImportMarkdownModalProps {
  onClose: () => void;
  onImport: (notes: ParsedNote[]) => void;
}

function parseMarkdownFile(text: string): ParsedNote[] {
  // Split on --- section dividers (our export format)
  const rawSections = text.split(/\n\s*---\s*\n/);

  const sections = rawSections
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    // Skip the file header block (starts with "# ... — Notes" + export date)
    .filter((s) => !/^#[^#].*—\s*Notes/i.test(s.split("\n")[0]) );

  if (sections.length === 0) return [];

  return sections.map((section) => {
    const lines = section.split("\n");
    let tags: string[] = [];

    // Detect and strip the metadata line: *date · Tags: tag1, tag2*
    const metaIndex = lines.findIndex((l) => /^\*.*·.*\*$/.test(l.trim()));
    if (metaIndex !== -1) {
      const metaLine = lines[metaIndex];
      const tagsMatch = metaLine.match(/Tags:\s*([^*]+)/i);
      if (tagsMatch) {
        tags = tagsMatch[1]
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
      lines.splice(metaIndex, 1);
      // Also remove any blank line left behind
      if (metaIndex < lines.length && lines[metaIndex].trim() === "") {
        lines.splice(metaIndex, 1);
      }
    }

    const content = lines.join("\n").trim();
    return { content, tags };
  });
}

export default function ImportMarkdownModal({
  onClose,
  onImport,
}: ImportMarkdownModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedNote[]>([]);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError("");
    setPreview([]);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const notes = parseMarkdownFile(text);
        if (notes.length === 0) {
          setError("No note content found in this file.");
        } else {
          setPreview(notes);
        }
      } catch {
        setError("Could not parse the file.");
      }
    };
    reader.readAsText(selected);
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
                Import from Markdown
              </h2>
              <p className="text-sm text-slate-400 !mt-1">
                Upload a .md file — single note or a multi-note export
              </p>
            </div>
            <button
              onClick={onClose}
              className="!p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drop zone */}
          <div className="!mb-6">
            <label
              htmlFor="md-import-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center !pt-5 !pb-6">
                {file ? (
                  <>
                    <FileText className="text-purple-400 !mb-3" size={40} />
                    <p className="text-sm font-medium text-slate-300">{file.name}</p>
                    <p className="text-xs text-slate-500 !mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-400 !mb-3" size={40} />
                    <p className="!mb-1 text-sm text-slate-300">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-slate-500">.md files only</p>
                  </>
                )}
              </div>
              <input
                id="md-import-upload"
                type="file"
                className="hidden"
                accept=".md,.markdown,text/markdown"
                onChange={handleFileChange}
              />
            </label>
            {error && <p className="text-sm text-red-400 !mt-2">{error}</p>}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="!mb-6">
              <p className="text-sm font-medium text-slate-300 !mb-3">
                {preview.length} note{preview.length !== 1 ? "s" : ""} found:
              </p>
              <ul className="!space-y-2 max-h-48 overflow-y-auto">
                {preview.map((note, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 !p-3 bg-slate-800/50 rounded-lg text-sm"
                  >
                    <FileText size={16} className="text-purple-400 flex-shrink-0 !mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-slate-200 truncate">
                        {deriveNoteTitle(note.content)}
                      </p>
                      {note.tags.length > 0 && (
                        <p className="text-xs text-slate-500 !mt-0.5">
                          Tags: {note.tags.join(", ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Format hint */}
          {!file && (
            <div className="bg-slate-800/50 !p-4 rounded-lg !mb-6 text-xs text-slate-400 !space-y-1">
              <p className="font-medium text-slate-300">Supported formats:</p>
              <p>• Any plain <code>.md</code> file → imported as a single note</p>
              <p>• Multi-note export from this app → split back into individual notes, tags restored</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onImport(preview)} disabled={preview.length === 0}>
              <Upload size={16} />
              Import {preview.length > 0 ? `(${preview.length} note${preview.length !== 1 ? "s" : ""})` : ""}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
