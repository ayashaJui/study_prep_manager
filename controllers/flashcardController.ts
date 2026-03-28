import Flashcard from "@/models/Flashcard";
import Topic from "@/models/Topic";
import mongoose from "mongoose";

// Get all flashcards for a topic
export const getFlashcardsByTopic = async (topicId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new Error("Invalid topic ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const flashcards = await Flashcard.find({ topicId, userId }).sort({
    createdAt: -1,
  });
  return flashcards;
};

// Get single flashcard by ID
export const getFlashcardById = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid flashcard ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const flashcard = await Flashcard.findOne({ _id: id, userId });

  if (!flashcard) {
    throw new Error("Flashcard not found");
  }

  return flashcard;
};

// Create a new flashcard
export const createFlashcard = async (data: any) => {
  const { topicId, front, back, tags, difficulty } = data;

  // Validate topic exists
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new Error("Invalid topic ID");
  }

  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new Error("Topic not found");
  }

  // Create flashcard
  const flashcard = await Flashcard.create({
    topicId,
    front,
    back,
    tags: tags || [],
    difficulty: difficulty || "medium",
  });

  // Update topic stats
  await Topic.findByIdAndUpdate(topicId, {
    $inc: { "stats.flashcardsCount": 1 },
  });

  return flashcard;
};

// Update flashcard
export const updateFlashcard = async (
  id: string,
  data: any,
  userId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid flashcard ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const flashcard = await Flashcard.findOneAndUpdate(
    { _id: id, userId },
    data,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!flashcard) {
    throw new Error("Flashcard not found");
  }

  return flashcard;
};

// Delete flashcard
export const deleteFlashcard = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid flashcard ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const flashcard = await Flashcard.findOneAndDelete({ _id: id, userId });

  if (!flashcard) {
    throw new Error("Flashcard not found");
  }

  // Update topic stats
  await Topic.findByIdAndUpdate(flashcard.topicId, {
    $inc: { "stats.flashcardsCount": -1 },
  });

  return flashcard;
};
