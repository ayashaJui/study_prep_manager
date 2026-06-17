const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "";
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const SAMPLE_USER_EMAIL =
  process.env.SAMPLE_USER_EMAIL || "sample.user@example.com";
const SAMPLE_USER_PASSWORD =
  process.env.SAMPLE_USER_PASSWORD || "SamplePass123!";
const SAMPLE_USER_NAME = process.env.SAMPLE_USER_NAME || "Sample User";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    provider: { type: String, default: "credentials" },
    avatar: { type: String, default: null },
    emailVerified: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const topicSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    level: { type: Number, default: 0 },
    path: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
    status: { type: String, default: "not-started" },
    tags: [String],
    favorite: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, default: null },
    stats: {
      notesCount: { type: Number, default: 0 },
      flashcardsCount: { type: Number, default: 0 },
      quizzesCount: { type: Number, default: 0 },
      completionPercentage: { type: Number, default: 0 },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const noteSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    content: { type: String, required: true },
    tags: [String],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const flashcardSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    front: { type: String, required: true },
    back: { type: String, required: true },
    tags: [String],
    difficulty: { type: String, default: "medium" },
    status: { type: String, default: "new" },
    confidence: { type: String, default: "medium" },
    lastReviewed: Date,
    nextReview: Date,
    easeFactor: { type: Number, default: 2.5 },
    intervalDays: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const quizSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    difficulty: { type: String, default: "medium" },
    type: { type: String, default: "multiple-choice" },
    timeLimit: Number,
    tags: [String],
    questions: [
      {
        id: String,
        question: String,
        options: [String],
        correctAnswer: mongoose.Schema.Types.Mixed,
        explanation: String,
        points: { type: Number, default: 1 },
        tags: [String],
      },
    ],
    attempts: Array,
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showAnswersImmediately: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    activityType: { type: String, required: true },
    duration: { type: Number, default: 0 },
    score: { type: Number, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
const Flashcard =
  mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema);
const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
const StudySession =
  mongoose.models.StudySession ||
  mongoose.model("StudySession", studySessionSchema);

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

async function seed() {
  const shouldClear = process.argv.includes("--clear");

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  let user = await User.findOne({ email: SAMPLE_USER_EMAIL.toLowerCase() });

  if (shouldClear) {
    if (!user) {
      console.log("ℹ️  No sample user found to clear.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const userId = user._id;
    await Promise.all([
      Note.deleteMany({ userId }),
      Flashcard.deleteMany({ userId }),
      Quiz.deleteMany({ userId }),
      Topic.deleteMany({ userId }),
      StudySession.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
    ]);

    console.log("✅ Sample data cleared.");
    await mongoose.disconnect();
    process.exit(0);
  }

  if (!user) {
    const hashedPassword = await bcryptjs.hash(SAMPLE_USER_PASSWORD, 10);
    user = await User.create({
      name: SAMPLE_USER_NAME,
      email: SAMPLE_USER_EMAIL.toLowerCase(),
      password: hashedPassword,
      provider: "credentials",
      emailVerified: true,
    });
    console.log("✅ Created sample user");
  } else {
    console.log("ℹ️  Sample user already exists");
  }

  const userId = user._id;

  const topics = await Topic.insertMany([
    {
      name: "Algorithms",
      slug: slugify("Algorithms"),
      description: "Core algorithm patterns and techniques",
      level: 0,
      parentId: null,
      path: [],
      status: "in-progress",
      tags: ["core", "interview"],
      favorite: true,
      isPublic: true,
      shareId: crypto.randomUUID(),
      stats: {
        notesCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
        completionPercentage: 45,
      },
      userId,
    },
    {
      name: "System Design",
      slug: slugify("System Design"),
      description: "Scalable design and architecture prep",
      level: 0,
      parentId: null,
      path: [],
      status: "review",
      tags: ["design", "backend"],
      favorite: false,
      isPublic: false,
      shareId: null,
      stats: {
        notesCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
        completionPercentage: 30,
      },
      userId,
    },
    {
      name: "Behavioral",
      slug: slugify("Behavioral"),
      description: "Story bank and communication practice",
      level: 0,
      parentId: null,
      path: [],
      status: "not-started",
      tags: ["soft-skills"],
      favorite: false,
      isPublic: false,
      shareId: null,
      stats: {
        notesCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
        completionPercentage: 10,
      },
      userId,
    },
  ]);

  const algorithms = topics[0];
  const systemDesign = topics[1];
  const behavioral = topics[2];

  const subtopics = await Topic.insertMany([
    {
      name: "Arrays",
      slug: slugify("Arrays"),
      description: "Sliding window and prefix sums",
      level: 1,
      parentId: algorithms._id,
      path: [algorithms._id],
      status: "review",
      tags: ["arrays"],
      favorite: false,
      stats: {
        notesCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
        completionPercentage: 60,
      },
      userId,
    },
    {
      name: "Caching",
      slug: slugify("Caching"),
      description: "Cache layers, TTL, invalidation",
      level: 1,
      parentId: systemDesign._id,
      path: [systemDesign._id],
      status: "in-progress",
      tags: ["cache"],
      favorite: false,
      stats: {
        notesCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
        completionPercentage: 20,
      },
      userId,
    },
    {
      name: "STAR Framework",
      slug: slugify("STAR Framework"),
      description: "Situation, Task, Action, Result",
      level: 1,
      parentId: behavioral._id,
      path: [behavioral._id],
      status: "in-progress",
      tags: ["behavioral"],
      favorite: false,
      stats: {
        notesCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
        completionPercentage: 20,
      },
      userId,
    },
    {
      name: "Leadership",
      slug: slugify("Leadership"),
      description: "Ownership and influence stories",
      level: 1,
      parentId: behavioral._id,
      path: [behavioral._id],
      status: "review",
      tags: ["behavioral"],
      favorite: false,
      stats: {
        notesCount: 0,
        flashcardsCount: 0,
        quizzesCount: 0,
        completionPercentage: 25,
      },
      userId,
    },
  ]);

  const arraysTopic = subtopics[0];
  const cachingTopic = subtopics[1];
  const starTopic = subtopics[2];
  const leadershipTopic = subtopics[3];

  const notes = await Note.insertMany([
    {
      topicId: algorithms._id,
      content:
        "# Algorithm Cheatsheet\n\nBig-O, traversal patterns, and common pitfalls.",
      tags: ["summary"],
      userId,
    },
    {
      topicId: arraysTopic._id,
      content:
        "# Sliding Window\n\nTrack a moving window with two pointers for O(n) scans.",
      tags: ["arrays"],
      userId,
    },
    {
      topicId: systemDesign._id,
      content:
        "# Service Sizing\n\nEstimate QPS, storage, and throughput to size services.",
      tags: ["planning"],
      userId,
    },
    {
      topicId: cachingTopic._id,
      content:
        "# Cache Invalidation\n\nWrite-through vs write-back and eviction strategies.",
      tags: ["cache"],
      userId,
    },
    {
      topicId: starTopic._id,
      content:
        "# STAR Outline\n\nSituation, Task, Action, Result structure for stories.",
      tags: ["behavioral"],
      userId,
    },
    {
      topicId: leadershipTopic._id,
      content:
        "# Leadership Examples\n\nExamples that show ownership and mentoring.",
      tags: ["behavioral"],
      userId,
    },
  ]);

  const flashcards = await Flashcard.insertMany([
    {
      topicId: arraysTopic._id,
      front: "Two-sum with hash map time?",
      back: "O(n)",
      tags: ["arrays"],
      difficulty: "easy",
      status: "review",
      confidence: "easy",
      reviewCount: 3,
      intervalDays: 6,
      easeFactor: 2.6,
      lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      userId,
    },
    {
      topicId: arraysTopic._id,
      front: "When to use prefix sums?",
      back: "Range sum queries with O(1) lookups after O(n) build.",
      tags: ["arrays"],
      difficulty: "medium",
      status: "learning",
      confidence: "medium",
      reviewCount: 1,
      intervalDays: 1,
      easeFactor: 2.4,
      lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      userId,
    },
    {
      topicId: cachingTopic._id,
      front: "Cache stampede mitigation?",
      back: "Request coalescing, locking, or stale-while-revalidate.",
      tags: ["cache"],
      difficulty: "hard",
      status: "new",
      confidence: "hard",
      reviewCount: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      userId,
    },
    {
      topicId: starTopic._id,
      front: "What does STAR stand for?",
      back: "Situation, Task, Action, Result.",
      tags: ["behavioral"],
      difficulty: "easy",
      status: "learning",
      confidence: "easy",
      reviewCount: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      userId,
    },
    {
      topicId: leadershipTopic._id,
      front: "What makes a strong leadership story?",
      back: "Clear ownership, impact, and reflection on results.",
      tags: ["behavioral"],
      difficulty: "medium",
      status: "review",
      confidence: "medium",
      reviewCount: 2,
      intervalDays: 3,
      easeFactor: 2.4,
      lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      userId,
    },
  ]);

  const quizzes = await Quiz.insertMany([
    {
      topicId: arraysTopic._id,
      title: "Array Patterns Quiz",
      description: "Warm-up on arrays",
      difficulty: "easy",
      type: "multiple-choice",
      tags: ["arrays"],
      questions: [
        {
          id: "q-arr-1",
          question: "Time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n log n)"],
          correctAnswer: 1,
          explanation: "Binary search halves the search space each step.",
          points: 1,
          tags: [],
        },
      ],
      shuffleQuestions: false,
      shuffleOptions: false,
      showAnswersImmediately: false,
      userId,
    },
    {
      topicId: cachingTopic._id,
      title: "Caching Basics",
      description: "Cache fundamentals",
      difficulty: "medium",
      type: "multiple-choice",
      tags: ["cache"],
      questions: [
        {
          id: "q-cache-1",
          question: "What does TTL stand for?",
          options: [
            "Time to live",
            "Total traffic load",
            "Tiered table lookup",
          ],
          correctAnswer: 0,
          explanation: "TTL is the expiration window for cached data.",
          points: 1,
          tags: [],
        },
      ],
      shuffleQuestions: false,
      shuffleOptions: false,
      showAnswersImmediately: false,
      userId,
    },
    {
      topicId: starTopic._id,
      title: "Behavioral STAR Quiz",
      description: "Practice STAR structure",
      difficulty: "easy",
      type: "multiple-choice",
      tags: ["behavioral"],
      questions: [
        {
          id: "q-star-1",
          question: "Which STAR step describes what you did?",
          options: ["Situation", "Task", "Action", "Result"],
          correctAnswer: 2,
          explanation: "Action captures what you personally did.",
          points: 1,
          tags: [],
        },
      ],
      shuffleQuestions: false,
      shuffleOptions: false,
      showAnswersImmediately: false,
      userId,
    },
    {
      topicId: leadershipTopic._id,
      title: "Leadership Signals",
      description: "Ownership and influence",
      difficulty: "medium",
      type: "multiple-choice",
      tags: ["behavioral"],
      questions: [
        {
          id: "q-lead-1",
          question: "Which behavior signals ownership?",
          options: [
            "Wait for instructions",
            "Proactively unblock the team",
            "Avoid difficult decisions",
          ],
          correctAnswer: 1,
          explanation: "Ownership shows up in proactive action.",
          points: 1,
          tags: [],
        },
      ],
      shuffleQuestions: false,
      shuffleOptions: false,
      showAnswersImmediately: false,
      userId,
    },
  ]);

  const today = new Date();
  const sessions = [];
  for (let i = 0; i < 5; i++) {
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() - i);
    sessions.push({
      userId,
      topicId: i % 2 === 0 ? arraysTopic._id : cachingTopic._id,
      activityType: i % 2 === 0 ? "flashcard" : "quiz",
      duration: 10 + i * 5,
      score: i % 2 === 0 ? undefined : 80 + i,
      createdAt: sessionDate,
    });
  }
  await StudySession.insertMany(sessions);

  const updateStats = async (topicId) => {
    const [notesCount, flashcardsCount, quizzesCount] = await Promise.all([
      Note.countDocuments({ topicId }),
      Flashcard.countDocuments({ topicId }),
      Quiz.countDocuments({ topicId }),
    ]);

    await Topic.updateOne(
      { _id: topicId },
      {
        $set: {
          "stats.notesCount": notesCount,
          "stats.flashcardsCount": flashcardsCount,
          "stats.quizzesCount": quizzesCount,
        },
      },
    );
  };

  await Promise.all([
    updateStats(algorithms._id),
    updateStats(systemDesign._id),
    updateStats(behavioral._id),
    updateStats(arraysTopic._id),
    updateStats(cachingTopic._id),
    updateStats(starTopic._id),
    updateStats(leadershipTopic._id),
  ]);

  console.log("\n✅ Sample data seeded:");
  console.log(`- User: ${SAMPLE_USER_EMAIL}`);
  console.log(`- Password: ${SAMPLE_USER_PASSWORD}`);
  console.log(`- Topics: ${topics.length}`);
  console.log(`- Subtopics: ${subtopics.length}`);
  console.log(`- Notes: ${notes.length}`);
  console.log(`- Flashcards: ${flashcards.length}`);
  console.log(`- Quizzes: ${quizzes.length}`);
  console.log(`- Study Sessions: ${sessions.length}`);

  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB");
}

seed().catch((error) => {
  console.error("\n❌ Seed failed:", error.message || error);
  mongoose
    .disconnect()
    .catch(() => {})
    .finally(() => process.exit(1));
});
