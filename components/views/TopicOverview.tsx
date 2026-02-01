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
}

export default function TopicOverview({
  topic,
  subtopics,
  stats,
  onSubtopicSelect,
  onAddSubtopic,
}: TopicOverviewProps) {
  return (
    <Card>
      <CardTitle action={<Badge variant={topic.status}>{topic.status}</Badge>}>
        {topic.name}
      </CardTitle>

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
