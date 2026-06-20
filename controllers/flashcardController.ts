import Flashcard, { IFlashcard } from "@/models/Flashcard";
import Topic from "@/models/Topic";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "@/lib/errorHandler";

interface CreateFlashcardData {
  topicId: string;
  front: string;
  back: string;
  tags?: string[];
  difficulty?: IFlashcard["difficulty"];
  userId: string;
}

type UpdateFlashcardData = Partial<
  Pick<
    IFlashcard,
    | "front"
    | "back"
    | "tags"
    | "difficulty"
    | "status"
    | "confidence"
    | "lastReviewed"
    | "nextReview"
    | "easeFactor"
    | "intervalDays"
    | "reviewCount"
  >
>;

// Get all flashcards for a topic
export const getFlashcardsByTopic = async (topicId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new BadRequestError("Invalid topic ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID");
  }

  const flashcards = await Flashcard.find({ topicId, userId }).sort({
    createdAt: -1,
  });
  return flashcards;
};

// Get single flashcard by ID
export const getFlashcardById = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid flashcard ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID");
  }

  const flashcard = await Flashcard.findOne({ _id: id, userId });

  if (!flashcard) {
    throw new NotFoundError("Flashcard not found");
  }

  return flashcard;
};

// Create a new flashcard
export const createFlashcard = async (data: CreateFlashcardData) => {
  const { topicId, front, back, tags, difficulty, userId } = data;

  // Validate topic exists
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new BadRequestError("Invalid topic ID");
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID");
  }

  const topic = await Topic.findOne({ _id: topicId, userId });
  if (!topic) {
    throw new NotFoundError("Topic not found");
  }

  // Create flashcard
  const flashcard = await Flashcard.create({
    topicId,
    front,
    back,
    tags: tags || [],
    difficulty: difficulty || "medium",
    userId,
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
  data: UpdateFlashcardData,
  userId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid flashcard ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID");
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
    throw new NotFoundError("Flashcard not found");
  }

  return flashcard;
};

// Delete flashcard
export const deleteFlashcard = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid flashcard ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID");
  }

  const flashcard = await Flashcard.findOneAndDelete({ _id: id, userId });

  if (!flashcard) {
    throw new NotFoundError("Flashcard not found");
  }

  // Update topic stats
  await Topic.findByIdAndUpdate(flashcard.topicId, {
    $inc: { "stats.flashcardsCount": -1 },
  });

  return flashcard;
};

export const reviewFlashcard = async (
  id: string,
  quality: number,
  userId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid flashcard ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID");
  }

  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new BadRequestError("Invalid quality score");
  }

  const flashcard = await Flashcard.findOne({ _id: id, userId });
  if (!flashcard) {
    throw new NotFoundError("Flashcard not found");
  }

  const currentEase = flashcard.easeFactor || 2.5;
  const currentInterval = flashcard.intervalDays || 0;
  const currentReps = flashcard.reviewCount || 0;

  let newEase =
    currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEase = Math.min(3.5, Math.max(1.3, newEase));

  let newReps = currentReps;
  let newInterval = currentInterval;

  if (quality < 3) {
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = currentReps + 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEase);
    }
  }

  const confidence = quality >= 4 ? "easy" : quality === 3 ? "medium" : "hard";
  const status =
    quality < 3 ? "learning" : newReps >= 5 ? "mastered" : "review";

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + Math.max(1, newInterval));

  flashcard.easeFactor = newEase;
  flashcard.intervalDays = newInterval;
  flashcard.reviewCount = newReps;
  flashcard.lastReviewed = new Date();
  flashcard.nextReview = nextReview;
  flashcard.confidence = confidence;
  flashcard.status = status;

  await flashcard.save();
  return flashcard;
};
