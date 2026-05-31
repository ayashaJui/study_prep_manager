"use client";

import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardTitle, CardSection } from "@/components/ui/Card";
import SubtopicGrid from "@/components/features/SubtopicGrid";
import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { FileText, Inbox, HelpCircle } from "lucide-react";

interface TopicOverviewProps {
  topic: {
    id: string;
    name: string;
    status: "not-started" | "in-progress" | "review" | "mastered";
    progress: number;
    completedSubtopics: number;
    totalSubtopics: number;
    isPublic?: boolean;
    shareId?: string | null;
  };
  subtopics: Array<{
    id: string;
    name: string;
    description: string;
    flashcards: number;
    quizzes: number;
    notes: number;
  }>;
  stats: {
    notes: number;
    flashcards: number;
    quizzes: number;
  };
  onSubtopicSelect?: (id: string) => void;
  onAddSubtopic?: () => void;
  shareUrl?: string | null;
  isPublishing?: boolean;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onCopyShareUrl?: () => void;
}

export default function TopicOverview({
  topic,
  subtopics,
  stats,
  onSubtopicSelect,
  onAddSubtopic,
  shareUrl,
  isPublishing,
  onPublish,
  onUnpublish,
  onCopyShareUrl,
}: TopicOverviewProps) {
  return (
    <Card>
      <CardTitle action={<Badge variant={topic.status}>{topic.status}</Badge>}>
        {topic.name}
      </CardTitle>

      {topic.isPublic && shareUrl ? (
        <div className="!mt-4 !mb-2 flex flex-col gap-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Public Link
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full flex-1 rounded-md border border-slate-700 bg-slate-900/60 !px-3 !py-2 text-sm text-slate-200"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onCopyShareUrl}
                disabled={!onCopyShareUrl}
              >
                Copy
              </Button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-slate-600 !px-3 !py-2 text-sm text-slate-200 hover:bg-slate-700/50"
              >
                Open
              </a>
              {onUnpublish && (
                <Button
                  variant="secondary"
                  onClick={onUnpublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? "Working..." : "Unpublish"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="!mt-4 !mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Publish this topic to generate a public link.
          </p>
          {onPublish && (
            <Button onClick={onPublish} disabled={isPublishing}>
              {isPublishing ? "Working..." : "Publish"}
            </Button>
          )}
        </div>
      )}

      <CardSection
        title="Subtopics"
        action={
          <Button onClick={onAddSubtopic}>
            <Plus size={16} />
            Add Subtopic
          </Button>
        }
      >
        <SubtopicGrid subtopics={subtopics} onSelect={onSubtopicSelect} />
      </CardSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 !mt-8">
        <StatCard
          icon={<FileText size={24} />}
          value={stats.notes}
          label="General Notes"
          variant="blue"
        />
        <StatCard
          icon={<Inbox size={24} />}
          value={stats.flashcards}
          label="Flashcards"
          variant="green"
        />
        <StatCard
          icon={<HelpCircle size={24} />}
          value={stats.quizzes}
          label="Quizzes"
          variant="purple"
        />
      </div>

      <CardSection title="Progress Overview">
        <ProgressBar value={topic.progress} label="Completion Status" />
        <p className="!mt-3 text-sm text-slate-400">
          {topic.completedSubtopics} of {topic.totalSubtopics} subtopics marked
          as complete
        </p>
      </CardSection>
    </Card>
  );
}
