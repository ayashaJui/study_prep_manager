import Quiz, { IQuiz, IQuizQuestion } from "@/models/Quiz";
import Topic from "@/models/Topic";
import mongoose from "mongoose";

interface SubmitAnswer {
  questionId: string;
  selectedAnswer: number | number[] | null;
}

const arraysEqual = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
};

interface CreateQuizData {
  topicId: string;
  title: string;
  description?: string;
  difficulty?: IQuiz["difficulty"];
  type?: IQuiz["type"];
  timeLimit?: number;
  tags?: string[];
  questions?: IQuizQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showAnswersImmediately?: boolean;
}

type UpdateQuizData = Partial<
  Pick<
    IQuiz,
    | "title"
    | "description"
    | "source"
    | "difficulty"
    | "type"
    | "timeLimit"
    | "tags"
    | "questions"
    | "shuffleQuestions"
    | "shuffleOptions"
    | "showAnswersImmediately"
  >
>;

// Get all quizzes for a topic
export const getQuizzesByTopic = async (topicId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new Error("Invalid topic ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const quizzes = await Quiz.find({ topicId, userId }).sort({ createdAt: -1 });
  return quizzes;
};

// Get single quiz by ID
export const getQuizById = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid quiz ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const quiz = await Quiz.findOne({ _id: id, userId });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  return quiz;
};

// Create a new quiz
export const createQuiz = async (data: CreateQuizData, userId: string) => {
  const {
    topicId,
    title,
    description,
    difficulty,
    type,
    timeLimit,
    tags,
    questions,
    shuffleQuestions,
    shuffleOptions,
    showAnswersImmediately,
  } = data;

  // Validate topic exists
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new Error("Invalid topic ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const topic = await Topic.findOne({ _id: topicId, userId });
  if (!topic) {
    throw new Error("Topic not found");
  }

  // Create quiz
  const quiz = await Quiz.create({
    topicId,
    userId,
    title,
    description,
    difficulty: difficulty || "medium",
    type: type || "multiple-choice",
    timeLimit,
    tags: tags || [],
    questions: questions || [],
    shuffleQuestions: shuffleQuestions ?? false,
    shuffleOptions: shuffleOptions ?? false,
    showAnswersImmediately: showAnswersImmediately ?? true,
  });

  // Update topic stats
  await Topic.findByIdAndUpdate(topicId, {
    $inc: { "stats.quizzesCount": 1 },
  });

  return quiz;
};

// Update quiz
export const updateQuiz = async (
  id: string,
  data: UpdateQuizData,
  userId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid quiz ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const quiz = await Quiz.findOneAndUpdate({ _id: id, userId }, data, {
    new: true,
    runValidators: true,
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  return quiz;
};

// Submit a quiz attempt: scores answers server-side, records the attempt
export const submitQuizAttempt = async (
  id: string,
  userId: string,
  answers: SubmitAnswer[],
  timeTaken: number,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid quiz ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const quiz = await Quiz.findOne({ _id: id, userId });
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  let score = 0;
  let totalPoints = 0;
  for (const question of quiz.questions) {
    totalPoints += question.points || 1;
    const submitted = answers.find((a) => a.questionId === question.id);
    if (!submitted || submitted.selectedAnswer === null) continue;

    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];
    const selected = Array.isArray(submitted.selectedAnswer)
      ? submitted.selectedAnswer
      : [submitted.selectedAnswer];

    if (arraysEqual(selected, correctAnswers)) {
      score += question.points || 1;
    }
  }

  quiz.attempts.push({
    attemptId: new mongoose.Types.ObjectId(),
    date: new Date(),
    score,
    totalPoints,
    timeTaken,
    answers: [],
  });
  await quiz.save();

  return { quiz, score, totalPoints };
};

// Delete quiz
export const deleteQuiz = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid quiz ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const quiz = await Quiz.findOneAndDelete({ _id: id, userId });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  // Update topic stats
  await Topic.findByIdAndUpdate(quiz.topicId, {
    $inc: { "stats.quizzesCount": -1 },
  });

  return quiz;
};
