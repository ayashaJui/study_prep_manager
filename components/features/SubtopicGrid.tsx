interface SubtopicCardData {
  id: string;
  name: string;
  slug?: string;
  description: string;
  flashcards: number;
  quizzes: number;
  notes: number;
}

interface SubtopicGridProps {
  subtopics: SubtopicCardData[];
  onSelect?: (id: string) => void;
}

export default function SubtopicGrid({
  subtopics,
  onSelect,
}: SubtopicGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 !mt-3 md:!mt-4">
      {subtopics.map((subtopic) => (
        <div
          key={subtopic.id}
          onClick={() => onSelect?.(subtopic.slug || subtopic.id)}
          className="bg-slate-800/80 backdrop-blur-sm !p-6 rounded-xl border-2 border-slate-700/50 cursor-pointer transition-all hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 group"
        >
          <h4 className="text-lg font-semibold !mb-3 text-slate-50 group-hover:text-purple-400 transition-colors">
            {subtopic.name}
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed !mb-3">
            {subtopic.description}
          </p>
          <div className="text-xs text-slate-500">
            {subtopic.flashcards} flashcards • {subtopic.quizzes} quizzes •{" "}
            {subtopic.notes} notes
          </div>
        </div>
      ))}
    </div>
  );
}
