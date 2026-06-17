export function deriveNoteTitle(content: string): string {
  const firstLine =
    content
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0) || "";

  return firstLine.replace(/^#{1,6}\s*/, "").trim() || "Untitled note";
}

export function stripLeadingHeading(content: string): string {
  const lines = content.split("\n");
  const firstNonEmptyIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstNonEmptyIndex === -1) return content;
  if (!/^#{1,6}\s+/.test(lines[firstNonEmptyIndex].trim())) return content;

  return lines
    .slice(firstNonEmptyIndex + 1)
    .join("\n")
    .replace(/^\s*\n/, "");
}

export function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}