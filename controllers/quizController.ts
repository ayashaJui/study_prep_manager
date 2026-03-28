import Quiz from "@/models/Quiz";
import Topic from "@/models/Topic";
import mongoose from "mongoose";

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
export const createQuiz = async (data: any, userId: string) => {
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
export const updateQuiz = async (id: string, data: any, userId: string) => {
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
