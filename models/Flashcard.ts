import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interfaces
export interface IImportSource {
  type?: "manual" | "csv" | "json" | "anki" | "quizlet" | "generated";
  fileName?: string;
  importedAt?: Date;
  batchId?: string;
}

export interface IFlashcard {
  topicId: mongoose.Types.ObjectId;
  front: string;
  back: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  status: "new" | "learning" | "review" | "mastered";
  confidence: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  importSource?: IImportSource;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlashcardDocument extends IFlashcard, Document {}

export interface IFlashcardModel extends Model<IFlashcardDocument> {}

const flashcardSchema = new Schema<IFlashcardDocument, IFlashcardModel>(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    // Card content
    front: {
      type: String,
      required: true,
      minlength: [1, "Front content cannot be empty"],
    },
    back: {
      type: String,
      required: true,
      minlength: [1, "Back content cannot be empty"],
    },

    // Organization
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // Spaced repetition (for future use)
    status: {
      type: String,
      enum: ["new", "learning", "review", "mastered"],
      default: "new",
    },
    confidence: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    lastReviewed: Date,
    nextReview: Date,
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Import metadata
    importSource: {
      type: {
        type: String,
        enum: ["manual", "csv", "json", "anki", "quizlet", "generated"],
      },
      fileName: String,
      importedAt: Date,
      batchId: String,
    },

    // User reference (required for data isolation)
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Flashcard must belong to a user"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
flashcardSchema.index({ userId: 1, topicId: 1 });
flashcardSchema.index({ userId: 1, nextReview: 1 });
flashcardSchema.index({ userId: 1, difficulty: 1 });
flashcardSchema.index({ userId: 1, tags: 1 });
flashcardSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Flashcard ||
  mongoose.model<IFlashcardDocument, IFlashcardModel>(
    "Flashcard",
    flashcardSchema,
  );
