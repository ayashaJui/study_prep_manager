interface Quiz {
  id: string;
  title: string;
  source: string;
  date: string;
  lastScore?: string;
  description: string;
}

interface QuizListProps {
  quizzes: Quiz[];
  onTake?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function QuizList({
  quizzes,
  onTake,
  onEdit,
  onDelete,
}: QuizListProps) {
  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="bg-slate-700 !p-6 rounded-lg border-2 border-transparent transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
        >
          <div className="flex justify-between items-start gap-4 !mb-4 flex-wrap">
            <div className="flex-1">
              <h4 className="text-lg !mb-2 text-slate-50 font-medium">
                {quiz.title}
              </h4>
              <div className="text-sm text-slate-400">
                <span>Source: {quiz.source}</span>
                <span> • </span>
                <span>Added {quiz.date}</span>
                {quiz.lastScore && (
                  <>
                    <span> • </span>
                    <span className="text-green-500 font-medium">
                      Last score: {quiz.lastScore}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {onTake && (
                <button
                  onClick={() => onTake(quiz.id)}
                  className="!px-4 !py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  Take Quiz
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(quiz.id)}
                  className="!px-4 !py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(quiz.id)}
                  className="!px-4 !py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed">
            {quiz.description}
          </div>
        </div>
      ))}
    </div>
  );
}
