import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interfaces
export interface IQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[]; // Support both single and multiple answers
  explanation?: string;
  points: number;
  tags: string[];
}

export interface IQuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface IQuizAttempt {
  attemptId: mongoose.Types.ObjectId;
  date: Date;
  score: number;
  totalPoints: number;
  timeTaken: number; // seconds
  answers: IQuizAnswer[];
}

export interface IQuizImportSource {
  type?: "manual" | "csv" | "json" | "pdf" | "google-forms" | "generated";
  fileName?: string;
  importedAt?: Date;
  originalFormat?: string;
}

export interface IQuiz {
  topicId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  source?: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple-choice" | "true-false" | "mixed";
  timeLimit?: number; // minutes
  tags: string[];
  questions: IQuizQuestion[];
  importSource?: IQuizImportSource;
  attempts: IQuizAttempt[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showAnswersImmediately: boolean;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizDocument extends IQuiz, Document {
  lastScore: string | null; // virtual
  lastAttemptDate: string | null; // virtual
  attemptsCount: number; // virtual
}

export interface IQuizModel extends Model<IQuizDocument> {}

const questionSchema = new Schema<IQuizQuestion>(
  {
    id: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
      validate: {
        validator: function (options: string[]) {
          return options.length >= 2;
        },
        message: "Question must have at least 2 options",
      },
    },
    correctAnswer: {
      type: Schema.Types.Mixed, // Allows both number and array
      required: true,
      validate: {
        validator: function (value: number | number[]) {
          if (typeof value === "number") {
            return value >= 0;
          }
          if (Array.isArray(value)) {
            return (
              value.length > 0 &&
              value.every((v) => typeof v === "number" && v >= 0)
            );
          }
          return false;
        },
        message: "correctAnswer must be a number or array of numbers",
      },
    },
    explanation: String,
    points: {
      type: Number,
      default: 1,
      min: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false },
);

const attemptSchema = new Schema<IQuizAttempt>(
  {
    attemptId: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    date: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      min: 0,
    },
    totalPoints: {
      type: Number,
      min: 0,
    },
    timeTaken: {
      type: Number,
      min: 0,
    }, // seconds
    answers: [
      {
        questionId: String,
        selectedAnswer: Number,
        isCorrect: Boolean,
        pointsEarned: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { _id: false },
);

const quizSchema = new Schema<IQuizDocument, IQuizModel>(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    // Quiz details
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },

    // Quiz settings
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["multiple-choice", "true-false", "mixed"],
      default: "multiple-choice",
    },
    timeLimit: {
      type: Number,
      min: 1,
    }, // minutes
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Questions
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (questions: IQuizQuestion[]) {
          return questions.length > 0;
        },
        message: "Quiz must have at least one question",
      },
    },

    // Import metadata
    importSource: {
      type: {
        type: String,
        enum: ["manual", "csv", "json", "pdf", "google-forms", "generated"],
      },
      fileName: String,
      importedAt: Date,
      originalFormat: String,
    },

    // Quiz attempts
    attempts: [attemptSchema],

    // Quiz options
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    showAnswersImmediately: {
      type: Boolean,
      default: false,
    },

    // User reference (optional until user system is implemented)
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Validate questions before saving
quizSchema.pre("save", function () {
  // Validate each question's correctAnswer is within options range
  for (const question of this.questions) {
    if (Array.isArray(question.correctAnswer)) {
      // If correctAnswer is an array, check all indices
      for (const idx of question.correctAnswer) {
        if (
          typeof idx !== "number" ||
          idx < 0 ||
          idx >= question.options.length
        ) {
          throw new Error(
            `Question "${question.question}" has invalid correctAnswer index ${idx} (only ${question.options.length} options)`,
          );
        }
      }
    } else {
      // Single answer
      if (
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        throw new Error(
          `Question "${question.question}" has invalid correctAnswer index ${question.correctAnswer} (only ${question.options.length} options)`,
        );
      }
    }
  }
});

// Virtuals for UI compatibility
quizSchema.virtual("lastScore").get(function (this: IQuizDocument) {
  if (!this.attempts || this.attempts.length === 0) return null;
  const lastAttempt = this.attempts[this.attempts.length - 1];
  if (!lastAttempt.totalPoints) return "0%";
  return Math.round((lastAttempt.score / lastAttempt.totalPoints) * 100) + "%";
});

quizSchema.virtual("lastAttemptDate").get(function (this: IQuizDocument) {
  if (!this.attempts || this.attempts.length === 0) return null;
  const date = this.attempts[this.attempts.length - 1].date;
  // Format as "Jan 28, 2026"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

quizSchema.virtual("attemptsCount").get(function (this: IQuizDocument) {
  return this.attempts ? this.attempts.length : 0;
});

// Indexes
quizSchema.index({ userId: 1, topicId: 1 });
quizSchema.index({ userId: 1, difficulty: 1 });
quizSchema.index({ userId: 1, tags: 1 });
quizSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Quiz ||
  mongoose.model<IQuizDocument, IQuizModel>("Quiz", quizSchema);
