const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "";
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const SAMPLE_USER_EMAIL    = process.env.SAMPLE_USER_EMAIL    || "sample.user@example.com";
const SAMPLE_USER_PASSWORD = process.env.SAMPLE_USER_PASSWORD || "SamplePass123!";
const SAMPLE_USER_NAME     = process.env.SAMPLE_USER_NAME     || "Sample User";

const SAMPLE_USER2_EMAIL    = "alex.dev@example.com";
const SAMPLE_USER2_PASSWORD = "AlexPass123!";
const SAMPLE_USER2_NAME     = "Alex Dev";

// ── Schemas ──────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  { name: String, email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false }, provider: { type: String, default: "credentials" },
    avatar: { type: String, default: null }, emailVerified: { type: Boolean, default: true } },
  { timestamps: true },
);

const topicSchema = new mongoose.Schema(
  { name: String, slug: String, description: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
    level: { type: Number, default: 0 },
    path: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
    status: { type: String, default: "not-started" }, tags: [String],
    favorite: { type: Boolean, default: false }, isPublic: { type: Boolean, default: false },
    shareId: String,
    stats: { notesCount: { type: Number, default: 0 }, flashcardsCount: { type: Number, default: 0 },
             quizzesCount: { type: Number, default: 0 }, completionPercentage: { type: Number, default: 0 } },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } },
  { timestamps: true },
);

const noteSchema = new mongoose.Schema(
  { topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    title: String, content: { type: String, required: true },
    pinned: { type: Boolean, default: false }, tags: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } },
  { timestamps: true },
);

const flashcardSchema = new mongoose.Schema(
  { topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    front: { type: String, required: true }, back: { type: String, required: true },
    tags: [String], difficulty: { type: String, default: "medium" },
    status: { type: String, default: "new" }, confidence: { type: String, default: "medium" },
    lastReviewed: Date, nextReview: Date,
    easeFactor: { type: Number, default: 2.5 }, intervalDays: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } },
  { timestamps: true },
);

const quizSchema = new mongoose.Schema(
  { topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    title: String, description: String, difficulty: { type: String, default: "medium" },
    type: { type: String, default: "multiple-choice" }, timeLimit: Number, tags: [String],
    questions: [{ id: String, question: String, options: [String],
                  correctAnswer: mongoose.Schema.Types.Mixed, explanation: String,
                  points: { type: Number, default: 1 }, tags: [String] }],
    attempts: Array, shuffleQuestions: Boolean, shuffleOptions: Boolean,
    showAnswersImmediately: Boolean,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } },
  { timestamps: true },
);

const studySessionSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
    activityType: { type: String, required: true },
    duration: { type: Number, default: 0 },
    score: { type: Number, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now } },
  { timestamps: false },
);

const problemSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
    title: { type: String, required: true }, platform: { type: String, required: true },
    problemNumber: String, url: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    status: { type: String, enum: ["unsolved", "attempted", "solved"], default: "unsolved" },
    tags: [String], notes: String, timeComplexity: String, spaceComplexity: String,
    language: String, nextReview: Date, reviewInterval: Number,
    reviewCount: { type: Number, default: 0 }, lastReviewedAt: Date },
  { timestamps: true },
);

const User         = mongoose.models.User         || mongoose.model("User",         userSchema);
const Topic        = mongoose.models.Topic        || mongoose.model("Topic",        topicSchema);
const Note         = mongoose.models.Note         || mongoose.model("Note",         noteSchema);
const Flashcard    = mongoose.models.Flashcard    || mongoose.model("Flashcard",    flashcardSchema);
const Quiz         = mongoose.models.Quiz         || mongoose.model("Quiz",         quizSchema);
const StudySession = mongoose.models.StudySession || mongoose.model("StudySession", studySessionSchema);
const Problem      = mongoose.models.Problem      || mongoose.model("Problem",      problemSchema);

const slugify = (v) => v.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
const daysAgo  = (n) => new Date(Date.now() - n * 86400000);
const daysFrom = (n) => new Date(Date.now() + n * 86400000);

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const shouldClear = process.argv.includes("--clear");

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  let user  = await User.findOne({ email: SAMPLE_USER_EMAIL.toLowerCase() });
  let user2 = await User.findOne({ email: SAMPLE_USER2_EMAIL.toLowerCase() });

  if (shouldClear) {
    const toDelete = [user, user2].filter(Boolean);
    if (!toDelete.length) { console.log("ℹ️  No sample users found to clear."); await mongoose.disconnect(); process.exit(0); }
    await Promise.all(toDelete.map(async (u) => {
      const uid = u._id;
      await Promise.all([
        Note.deleteMany({ userId: uid }), Flashcard.deleteMany({ userId: uid }),
        Quiz.deleteMany({ userId: uid }), Topic.deleteMany({ userId: uid }),
        StudySession.deleteMany({ userId: uid }), Problem.deleteMany({ userId: uid }),
        User.deleteOne({ _id: uid }),
      ]);
    }));
    console.log("✅ Sample data cleared (both users).");
    await mongoose.disconnect(); process.exit(0);
  }

  if (!user) {
    const hashedPassword = await bcryptjs.hash(SAMPLE_USER_PASSWORD, 10);
    user = await User.create({ name: SAMPLE_USER_NAME, email: SAMPLE_USER_EMAIL.toLowerCase(),
                               password: hashedPassword, provider: "credentials", emailVerified: true });
    console.log("✅ Created user 1 (Sample User)");
  } else {
    console.log("ℹ️  User 1 already exists");
  }

  if (!user2) {
    const hashedPassword2 = await bcryptjs.hash(SAMPLE_USER2_PASSWORD, 10);
    user2 = await User.create({ name: SAMPLE_USER2_NAME, email: SAMPLE_USER2_EMAIL.toLowerCase(),
                                password: hashedPassword2, provider: "credentials", emailVerified: true });
    console.log("✅ Created user 2 (Alex Dev)");
  } else {
    console.log("ℹ️  User 2 already exists");
  }

  const userId = user._id;

  // ── Root topics ─────────────────────────────────────────────────────────────

  const [dsa, sysdesign, behavioral] = await Topic.insertMany([
    { name: "Data Structures & Algorithms", slug: slugify("Data Structures & Algorithms"),
      description: "Core DSA patterns for coding interviews — arrays, trees, graphs, DP.",
      level: 0, parentId: null, path: [], status: "in-progress",
      tags: ["core", "interview"], favorite: true, isPublic: true, shareId: crypto.randomUUID(),
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 55 }, userId },

    { name: "System Design", slug: slugify("System Design"),
      description: "Scalable architecture: caching, databases, load balancing, queues.",
      level: 0, parentId: null, path: [], status: "review",
      tags: ["design", "backend"], favorite: true, isPublic: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 35 }, userId },

    { name: "Behavioral", slug: slugify("Behavioral"),
      description: "STAR stories, leadership signals, and conflict resolution examples.",
      level: 0, parentId: null, path: [], status: "not-started",
      tags: ["soft-skills"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 10 }, userId },
  ]);

  // ── Subtopics ────────────────────────────────────────────────────────────────

  const [arrays, twoPointers, slidingWindow, dp, trees,
         caching, databases, star, leadership] = await Topic.insertMany([
    // DSA subtopics
    { name: "Arrays", slug: slugify("Arrays"),
      description: "Prefix sums, kadane's, and in-place manipulation.",
      level: 1, parentId: dsa._id, path: [dsa._id], status: "mastered",
      tags: ["arrays"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 100 }, userId },

    { name: "Two Pointers", slug: slugify("Two Pointers"),
      description: "Opposite ends and fast/slow pointer techniques.",
      level: 1, parentId: dsa._id, path: [dsa._id], status: "review",
      tags: ["pointers"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 75 }, userId },

    { name: "Sliding Window", slug: slugify("Sliding Window"),
      description: "Fixed and variable-size window problems.",
      level: 1, parentId: dsa._id, path: [dsa._id], status: "in-progress",
      tags: ["arrays", "window"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 50 }, userId },

    { name: "Dynamic Programming", slug: slugify("Dynamic Programming"),
      description: "Memoization, tabulation, and classic DP patterns.",
      level: 1, parentId: dsa._id, path: [dsa._id], status: "in-progress",
      tags: ["dp"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 40 }, userId },

    { name: "Trees & Graphs", slug: slugify("Trees & Graphs"),
      description: "DFS, BFS, topological sort, and union-find.",
      level: 1, parentId: dsa._id, path: [dsa._id], status: "not-started",
      tags: ["trees", "graphs"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 20 }, userId },

    // System Design subtopics
    { name: "Caching & CDN", slug: slugify("Caching & CDN"),
      description: "Redis, eviction policies, CDN edge caching.",
      level: 1, parentId: sysdesign._id, path: [sysdesign._id], status: "in-progress",
      tags: ["cache", "cdn"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 40 }, userId },

    { name: "Databases", slug: slugify("Databases"),
      description: "SQL vs NoSQL, sharding, replication, indexing.",
      level: 1, parentId: sysdesign._id, path: [sysdesign._id], status: "not-started",
      tags: ["sql", "nosql"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 15 }, userId },

    // Behavioral subtopics
    { name: "STAR Framework", slug: slugify("STAR Framework"),
      description: "Situation · Task · Action · Result structure for interview stories.",
      level: 1, parentId: behavioral._id, path: [behavioral._id], status: "in-progress",
      tags: ["behavioral", "communication"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 25 }, userId },

    { name: "Leadership & Ownership", slug: slugify("Leadership & Ownership"),
      description: "Examples that demonstrate initiative and cross-team impact.",
      level: 1, parentId: behavioral._id, path: [behavioral._id], status: "not-started",
      tags: ["leadership"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 10 }, userId },
  ]);

  // ── Notes ────────────────────────────────────────────────────────────────────

  const notes = await Note.insertMany([
    // Pinned notes (shown in Pinned Notes view)
    { topicId: arrays._id, title: "Array Patterns Cheatsheet",
      content: "# Array Patterns Cheatsheet\n\n## Prefix Sum\nBuild a prefix array in O(n), then answer range sum queries in O(1).\n\n```python\nprefix = [0] * (n + 1)\nfor i in range(n):\n    prefix[i+1] = prefix[i] + nums[i]\n# range sum [l, r]\ntotal = prefix[r+1] - prefix[l]\n```\n\n## Kadane's Algorithm\nMax subarray in O(n):\n```python\nmax_sum = cur = nums[0]\nfor x in nums[1:]:\n    cur = max(x, cur + x)\n    max_sum = max(max_sum, cur)\n```",
      pinned: true, tags: ["arrays", "cheatsheet", "must-review"], userId },

    { topicId: caching._id, title: "Cache Design Quick Reference",
      content: "# Cache Design Quick Reference\n\n## Eviction Policies\n- **LRU** — least recently used (most common)\n- **LFU** — least frequently used\n- **FIFO** — simple but rarely optimal\n\n## Write Strategies\n| Strategy | Consistency | Latency |\n|---|---|---|\n| Write-through | High | Higher |\n| Write-back | Lower | Lower |\n| Write-around | High | Read miss penalty |\n\n## Cache Stampede\nUse mutex locking or probabilistic early expiration to prevent thundering herd.",
      pinned: true, tags: ["cache", "system-design", "cheatsheet"], userId },

    // Regular notes
    { topicId: dsa._id, title: "Big-O Reference",
      content: "# Big-O Reference\n\nO(1) → hash table lookup\nO(log n) → binary search\nO(n) → linear scan\nO(n log n) → merge sort\nO(n²) → nested loops\nO(2ⁿ) → subset enumeration\nO(n!) → permutations",
      pinned: false, tags: ["complexity"], userId },

    { topicId: twoPointers._id, title: "Two Pointers Patterns",
      content: "# Two Pointers\n\n## Opposite Ends\nUsed for sorted array problems. Start left=0, right=n-1.\nExample: two-sum on sorted array, container with most water.\n\n## Fast & Slow (Floyd's)\nDetect cycle in linked list. Fast moves 2x, slow moves 1x.\nIf they meet → cycle exists.\n\n## Partition\nSeparate elements in place (Dutch National Flag, Lomuto partition).",
      pinned: false, tags: ["two-pointers"], userId },

    { topicId: slidingWindow._id, title: "Sliding Window Template",
      content: "# Sliding Window\n\n## Fixed Window\n```python\nwindow_sum = sum(nums[:k])\nresult = window_sum\nfor i in range(k, n):\n    window_sum += nums[i] - nums[i - k]\n    result = max(result, window_sum)\n```\n\n## Variable Window\n```python\nleft = 0\nfor right in range(n):\n    # expand window\n    while <invalid condition>:\n        # shrink window\n        left += 1\n    # update result\n```",
      pinned: false, tags: ["sliding-window", "template"], userId },

    { topicId: dp._id, title: "DP Decision Framework",
      content: "# When to Use DP\n\n1. **Optimal substructure** — problem can be broken into sub-problems\n2. **Overlapping sub-problems** — same sub-problems computed repeatedly\n\n## Common Patterns\n- **0/1 Knapsack** — include or exclude each item\n- **LCS / Edit Distance** — 2D table on two sequences\n- **Coin Change** — unbounded knapsack\n- **Fibonacci / Climbing Stairs** — 1D DP\n\n## Template\n```python\ndp = [default] * (n + 1)\ndp[base] = base_value\nfor i in range(...):\n    dp[i] = f(dp[i-1], dp[i-2], ...)\n```",
      pinned: false, tags: ["dp", "patterns"], userId },

    { topicId: trees._id, title: "DFS & BFS Templates",
      content: "# Tree Traversals\n\n## DFS (recursive)\n```python\ndef dfs(node):\n    if not node: return\n    # preorder: process here\n    dfs(node.left)\n    # inorder: process here\n    dfs(node.right)\n    # postorder: process here\n```\n\n## BFS (level order)\n```python\nfrom collections import deque\nq = deque([root])\nwhile q:\n    for _ in range(len(q)):\n        node = q.popleft()\n        if node.left:  q.append(node.left)\n        if node.right: q.append(node.right)\n```",
      pinned: false, tags: ["trees", "graphs", "traversal"], userId },

    { topicId: sysdesign._id, title: "Back-of-Envelope Estimation",
      content: "# Estimation Cheatsheet\n\n| Unit | Value |\n|------|-------|\n| 1 million req/day | ~12 req/s |\n| 1 billion req/day | ~12,000 req/s |\n| 1 KB × 1M users | 1 GB |\n| 1 MB × 1M users | 1 TB |\n\n## Steps\n1. Clarify scale (DAU, read/write ratio)\n2. Estimate QPS (peak = avg × 2-3×)\n3. Estimate storage (per record × records)\n4. Decide on partitioning strategy",
      pinned: false, tags: ["estimation", "system-design"], userId },

    { topicId: databases._id, title: "SQL vs NoSQL Decision",
      content: "# SQL vs NoSQL\n\n## Choose SQL when\n- Data is relational with complex joins\n- ACID transactions required\n- Schema is stable\n\n## Choose NoSQL when\n- Horizontal scale needed\n- Flexible / evolving schema\n- High write throughput (Cassandra)\n- Document or key-value access patterns (MongoDB, DynamoDB)\n\n## Indexing\nB-tree index: good for range queries\nHash index: exact lookups only\nComposite index: column order matters (leftmost prefix rule)",
      pinned: false, tags: ["databases", "sql", "nosql"], userId },

    { topicId: star._id, title: "STAR Story Bank Template",
      content: "# STAR Template\n\n**Situation** — Set the scene. What was the context? (1-2 sentences)\n\n**Task** — What was your responsibility? (1 sentence)\n\n**Action** — What did YOU specifically do? (3-4 sentences, use 'I' not 'we')\n\n**Result** — Quantify the outcome. (1-2 sentences with numbers)\n\n## Example Topics\n- Delivered under deadline pressure\n- Disagreed with a team decision\n- Mentored a junior engineer\n- Led a cross-team initiative\n- Fixed a production incident",
      pinned: false, tags: ["behavioral", "star"], userId },

    { topicId: leadership._id, title: "Leadership Story Examples",
      content: "# Leadership & Ownership Examples\n\n## Ownership\n> Noticed a recurring oncall issue, root-caused it, wrote a runbook, and reduced alert frequency by 80%.\n\n## Influence without Authority\n> Proposed API versioning standard to 3 teams. Got buy-in by showing concrete migration cost savings.\n\n## Mentorship\n> Paired with junior engineer for 6 weeks. They shipped their first feature independently.",
      pinned: false, tags: ["leadership", "examples"], userId },
  ]);

  // ── Flashcards ────────────────────────────────────────────────────────────────

  const flashcards = await Flashcard.insertMany([
    // Arrays
    { topicId: arrays._id, front: "What is the time complexity of prefix sum build?", back: "O(n) to build, O(1) per range query after.",
      tags: ["arrays", "prefix-sum"], difficulty: "easy", status: "review", confidence: "easy",
      reviewCount: 5, intervalDays: 7, easeFactor: 2.7, lastReviewed: daysAgo(3), nextReview: daysFrom(4), userId },
    { topicId: arrays._id, front: "Kadane's algorithm solves what problem?", back: "Maximum subarray sum in O(n) time and O(1) space.",
      tags: ["arrays", "dp"], difficulty: "medium", status: "review", confidence: "medium",
      reviewCount: 3, intervalDays: 3, easeFactor: 2.5, lastReviewed: daysAgo(2), nextReview: daysFrom(1), userId },
    { topicId: arrays._id, front: "How do you find all duplicates in an array in O(n) time and O(1) space?", back: "Mark visited indices as negative: for each nums[i], negate nums[abs(nums[i])-1]. Negatives indicate duplicates.",
      tags: ["arrays", "tricks"], difficulty: "hard", status: "learning", confidence: "hard",
      reviewCount: 1, intervalDays: 1, easeFactor: 2.3, lastReviewed: daysAgo(1), nextReview: daysFrom(0), userId },

    // Two Pointers
    { topicId: twoPointers._id, front: "When should you use the two-pointer pattern?", back: "When the array is sorted (or can be sorted) and you're searching for a pair or triplet satisfying a condition.",
      tags: ["two-pointers"], difficulty: "easy", status: "review", confidence: "easy",
      reviewCount: 4, intervalDays: 6, easeFactor: 2.6, lastReviewed: daysAgo(4), nextReview: daysFrom(2), userId },
    { topicId: twoPointers._id, front: "How does Floyd's cycle detection work?", back: "Fast pointer moves 2 steps, slow 1. If they meet, a cycle exists. To find the cycle start, reset one pointer to head and advance both 1 step at a time.",
      tags: ["linked-list", "cycle"], difficulty: "medium", status: "learning", confidence: "medium",
      reviewCount: 2, intervalDays: 2, easeFactor: 2.4, lastReviewed: daysAgo(1), nextReview: daysFrom(1), userId },

    // Sliding Window
    { topicId: slidingWindow._id, front: "What is the difference between fixed and variable sliding window?", back: "Fixed: window size k is constant. Variable: shrink window when a constraint is violated (e.g. at most k distinct chars).",
      tags: ["sliding-window"], difficulty: "medium", status: "new", confidence: "medium",
      reviewCount: 0, intervalDays: 0, easeFactor: 2.5, userId },

    // DP
    { topicId: dp._id, front: "What are the two conditions required for DP?", back: "1. Optimal substructure — optimal solution built from optimal sub-solutions.\n2. Overlapping sub-problems — same sub-problems solved multiple times.",
      tags: ["dp"], difficulty: "easy", status: "review", confidence: "easy",
      reviewCount: 3, intervalDays: 5, easeFactor: 2.6, lastReviewed: daysAgo(2), nextReview: daysFrom(3), userId },
    { topicId: dp._id, front: "Coin change — state and transition?", back: "State: dp[amount] = min coins. Transition: dp[i] = min(dp[i], dp[i - coin] + 1) for each coin.",
      tags: ["dp", "knapsack"], difficulty: "medium", status: "learning", confidence: "hard",
      reviewCount: 1, intervalDays: 1, easeFactor: 2.2, lastReviewed: daysAgo(1), nextReview: daysFrom(0), userId },

    // Caching
    { topicId: caching._id, front: "What does LRU evict?", back: "The Least Recently Used item — implemented with a doubly linked list + hashmap for O(1) get and put.",
      tags: ["cache", "lru"], difficulty: "medium", status: "review", confidence: "medium",
      reviewCount: 4, intervalDays: 4, easeFactor: 2.5, lastReviewed: daysAgo(2), nextReview: daysFrom(2), userId },
    { topicId: caching._id, front: "What is a cache stampede and how do you prevent it?", back: "Many requests hit the DB simultaneously after a cache miss. Prevent with: mutex locking, request coalescing, or probabilistic early expiration.",
      tags: ["cache", "stampede"], difficulty: "hard", status: "new", confidence: "hard",
      reviewCount: 0, intervalDays: 0, easeFactor: 2.5, userId },

    // Behavioral
    { topicId: star._id, front: "What does each letter in STAR stand for?", back: "Situation · Task · Action · Result",
      tags: ["behavioral", "star"], difficulty: "easy", status: "review", confidence: "easy",
      reviewCount: 6, intervalDays: 10, easeFactor: 2.8, lastReviewed: daysAgo(5), nextReview: daysFrom(5), userId },
    { topicId: leadership._id, front: "How do you show ownership in a behavioral answer?", back: "Describe a problem you proactively identified (not assigned), the initiative you took without being asked, and a measurable impact.",
      tags: ["leadership", "ownership"], difficulty: "medium", status: "learning", confidence: "medium",
      reviewCount: 2, intervalDays: 2, easeFactor: 2.4, lastReviewed: daysAgo(1), nextReview: daysFrom(1), userId },
  ]);

  // ── Quizzes ───────────────────────────────────────────────────────────────────

  const quizzes = await Quiz.insertMany([
    { topicId: arrays._id, title: "Array Fundamentals", description: "Test your knowledge of array techniques.",
      difficulty: "easy", type: "multiple-choice", tags: ["arrays"],
      questions: [
        { id: "q-arr-1", question: "What is the time complexity of binary search on a sorted array?",
          options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: 1,
          explanation: "Binary search halves the search space each iteration → O(log n).", points: 1, tags: [] },
        { id: "q-arr-2", question: "Which algorithm finds the maximum subarray sum in O(n)?",
          options: ["Binary search", "Kadane's algorithm", "Merge sort", "Floyd's algorithm"], correctAnswer: 1,
          explanation: "Kadane's algorithm keeps a running max subarray ending at each index.", points: 1, tags: [] },
        { id: "q-arr-3", question: "Prefix sum allows range sum queries in what time complexity?",
          options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: 2,
          explanation: "After an O(n) build, each range query is answered in O(1): prefix[r+1] - prefix[l].", points: 1, tags: [] },
      ],
      shuffleQuestions: false, shuffleOptions: false, showAnswersImmediately: false, userId },

    { topicId: dp._id, title: "Dynamic Programming Basics", description: "Classic DP patterns.",
      difficulty: "medium", type: "multiple-choice", tags: ["dp"],
      questions: [
        { id: "q-dp-1", question: "What is the minimum number of coins to make 11 cents with coins [1,5,6,9]?",
          options: ["2", "3", "4", "5"], correctAnswer: 0,
          explanation: "9 + 2×1 = 3 coins, but 6 + 5 = 2 coins. Answer: 2.", points: 1, tags: [] },
        { id: "q-dp-2", question: "Longest Common Subsequence of 'ABCBDAB' and 'BDCAB' has length?",
          options: ["3", "4", "5", "6"], correctAnswer: 1,
          explanation: "LCS is 'BCAB' or 'BDAB', length 4.", points: 1, tags: [] },
        { id: "q-dp-3", question: "Climbing stairs — how many ways to reach stair 5 (1 or 2 steps at a time)?",
          options: ["6", "7", "8", "9"], correctAnswer: 2,
          explanation: "Fibonacci-like: [1,1,2,3,5,8]. Stair 5 = 8 ways.", points: 1, tags: [] },
      ],
      shuffleQuestions: false, shuffleOptions: false, showAnswersImmediately: false, userId },

    { topicId: caching._id, title: "Caching Deep Dive", description: "Cache policies and design patterns.",
      difficulty: "medium", type: "multiple-choice", tags: ["cache", "system-design"],
      questions: [
        { id: "q-cache-1", question: "What does TTL stand for?",
          options: ["Time to live", "Total traffic load", "Tiered table lookup", "Transaction timeout limit"], correctAnswer: 0,
          explanation: "TTL (time to live) is the expiration window for a cached entry.", points: 1, tags: [] },
        { id: "q-cache-2", question: "Which write strategy guarantees cache and DB are always consistent?",
          options: ["Write-back", "Write-around", "Write-through", "Copy-on-write"], correctAnswer: 2,
          explanation: "Write-through writes to cache and DB simultaneously, keeping them in sync.", points: 1, tags: [] },
        { id: "q-cache-3", question: "LRU cache — what data structures implement it in O(1)?",
          options: ["Array + set", "Doubly linked list + hashmap", "BST + queue", "Heap + hashmap"], correctAnswer: 1,
          explanation: "Hashmap for O(1) access, doubly linked list to move nodes in O(1).", points: 1, tags: [] },
      ],
      shuffleQuestions: false, shuffleOptions: false, showAnswersImmediately: false, userId },

    { topicId: star._id, title: "Behavioral Interview Prep", description: "Practice STAR structure and signals.",
      difficulty: "easy", type: "multiple-choice", tags: ["behavioral"],
      questions: [
        { id: "q-beh-1", question: "In STAR, which component captures what YOU personally did?",
          options: ["Situation", "Task", "Action", "Result"], correctAnswer: 2,
          explanation: "Action is where you describe your specific contributions — use 'I', not 'we'.", points: 1, tags: [] },
        { id: "q-beh-2", question: "Which Result phrasing is strongest?",
          options: ["The team was happier.", "We improved things.", "Reduced oncall alerts by 40% over 2 months.", "I worked hard and it paid off."], correctAnswer: 2,
          explanation: "Results should be specific and quantified.", points: 1, tags: [] },
      ],
      shuffleQuestions: false, shuffleOptions: false, showAnswersImmediately: false, userId },
  ]);

  // ── Problems ──────────────────────────────────────────────────────────────────

  const problems = await Problem.insertMany([
    // Arrays problems
    { userId, topicId: arrays._id, title: "Two Sum", platform: "LeetCode", problemNumber: "1",
      url: "https://leetcode.com/problems/two-sum/", difficulty: "easy", status: "solved",
      tags: ["arrays", "hash-map"], notes: "Use a hash map. Store complement → index. One pass O(n).",
      timeComplexity: "O(n)", spaceComplexity: "O(n)", language: "Python",
      nextReview: daysAgo(1), reviewInterval: 7, reviewCount: 3, lastReviewedAt: daysAgo(8) },

    { userId, topicId: arrays._id, title: "Best Time to Buy and Sell Stock", platform: "LeetCode", problemNumber: "121",
      url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "easy", status: "solved",
      tags: ["arrays", "greedy"], notes: "Track min price seen so far, update max profit.",
      timeComplexity: "O(n)", spaceComplexity: "O(1)", language: "Python",
      nextReview: daysFrom(3), reviewInterval: 7, reviewCount: 2, lastReviewedAt: daysAgo(4) },

    { userId, topicId: arrays._id, title: "Product of Array Except Self", platform: "LeetCode", problemNumber: "238",
      url: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "medium", status: "solved",
      tags: ["arrays", "prefix"], notes: "Prefix product left pass, suffix product right pass. No division needed.",
      timeComplexity: "O(n)", spaceComplexity: "O(1)", language: "Python",
      nextReview: daysAgo(2), reviewInterval: 3, reviewCount: 2, lastReviewedAt: daysAgo(5) },

    { userId, topicId: arrays._id, title: "Maximum Product Subarray", platform: "LeetCode", problemNumber: "152",
      url: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: "medium", status: "attempted",
      tags: ["arrays", "dp"], notes: "Track both max and min (because negatives flip sign). Reset at 0.",
      timeComplexity: "O(n)", spaceComplexity: "O(1)", language: "Python",
      nextReview: daysAgo(0), reviewInterval: 1, reviewCount: 1, lastReviewedAt: daysAgo(1) },

    { userId, topicId: arrays._id, title: "Trapping Rain Water", platform: "LeetCode", problemNumber: "42",
      url: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "hard", status: "unsolved",
      tags: ["arrays", "two-pointers"], notes: "",
      timeComplexity: "", spaceComplexity: "", language: "" },

    // Two Pointers problems
    { userId, topicId: twoPointers._id, title: "Valid Palindrome", platform: "LeetCode", problemNumber: "125",
      url: "https://leetcode.com/problems/valid-palindrome/", difficulty: "easy", status: "solved",
      tags: ["two-pointers", "string"], notes: "Opposite pointers, skip non-alphanumeric, compare lowercase.",
      timeComplexity: "O(n)", spaceComplexity: "O(1)", language: "Python",
      nextReview: daysFrom(5), reviewInterval: 7, reviewCount: 4, lastReviewedAt: daysAgo(2) },

    { userId, topicId: twoPointers._id, title: "3Sum", platform: "LeetCode", problemNumber: "15",
      url: "https://leetcode.com/problems/3sum/", difficulty: "medium", status: "solved",
      tags: ["two-pointers", "sorting"], notes: "Sort, fix i, then two-pointer on the rest. Skip duplicates at both levels.",
      timeComplexity: "O(n²)", spaceComplexity: "O(1)", language: "Python",
      nextReview: daysAgo(1), reviewInterval: 3, reviewCount: 2, lastReviewedAt: daysAgo(4) },

    { userId, topicId: twoPointers._id, title: "Container With Most Water", platform: "LeetCode", problemNumber: "11",
      url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "medium", status: "attempted",
      tags: ["two-pointers", "greedy"], notes: "Move the shorter wall inward to maximize area.",
      timeComplexity: "O(n)", spaceComplexity: "O(1)", language: "" },

    // Sliding Window problems
    { userId, topicId: slidingWindow._id, title: "Longest Substring Without Repeating Characters", platform: "LeetCode", problemNumber: "3",
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "medium", status: "solved",
      tags: ["sliding-window", "hash-map"], notes: "Hash map stores last seen index. Advance left when duplicate found.",
      timeComplexity: "O(n)", spaceComplexity: "O(min(n,k))", language: "Python",
      nextReview: daysFrom(2), reviewInterval: 7, reviewCount: 3, lastReviewedAt: daysAgo(5) },

    { userId, topicId: slidingWindow._id, title: "Minimum Window Substring", platform: "LeetCode", problemNumber: "76",
      url: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "hard", status: "attempted",
      tags: ["sliding-window", "hash-map"], notes: "Track char counts and 'formed' count. Shrink from left when all needed chars satisfied.",
      timeComplexity: "O(|s| + |t|)", spaceComplexity: "O(|s| + |t|)", language: "Python" },

    // DP problems
    { userId, topicId: dp._id, title: "Climbing Stairs", platform: "LeetCode", problemNumber: "70",
      url: "https://leetcode.com/problems/climbing-stairs/", difficulty: "easy", status: "solved",
      tags: ["dp", "fibonacci"], notes: "Fibonacci variant: dp[i] = dp[i-1] + dp[i-2]. Optimize to two variables.",
      timeComplexity: "O(n)", spaceComplexity: "O(1)", language: "Python",
      nextReview: daysFrom(6), reviewInterval: 7, reviewCount: 5, lastReviewedAt: daysAgo(1) },

    { userId, topicId: dp._id, title: "Coin Change", platform: "LeetCode", problemNumber: "322",
      url: "https://leetcode.com/problems/coin-change/", difficulty: "medium", status: "attempted",
      tags: ["dp", "bfs"], notes: "BFS or DP. dp[i] = min(dp[i - coin] + 1 for each coin if i >= coin).",
      timeComplexity: "O(amount × coins)", spaceComplexity: "O(amount)", language: "Python",
      nextReview: daysAgo(0), reviewInterval: 1, reviewCount: 1, lastReviewedAt: daysAgo(1) },

    { userId, topicId: dp._id, title: "Word Break", platform: "LeetCode", problemNumber: "139",
      url: "https://leetcode.com/problems/word-break/", difficulty: "medium", status: "unsolved",
      tags: ["dp", "string"], notes: "", timeComplexity: "", spaceComplexity: "", language: "" },

    // Global problems (no topic)
    { userId, topicId: null, title: "Merge K Sorted Lists", platform: "LeetCode", problemNumber: "23",
      url: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "hard", status: "attempted",
      tags: ["heap", "linked-list"], notes: "Use a min-heap of size k. Pop min, push next node from same list.",
      timeComplexity: "O(n log k)", spaceComplexity: "O(k)", language: "Python",
      nextReview: daysAgo(2), reviewInterval: 1, reviewCount: 1, lastReviewedAt: daysAgo(3) },

    { userId, topicId: null, title: "LRU Cache", platform: "LeetCode", problemNumber: "146",
      url: "https://leetcode.com/problems/lru-cache/", difficulty: "medium", status: "solved",
      tags: ["design", "linked-list", "hash-map"], notes: "OrderedDict in Python makes this trivial. Or implement DLL + hashmap manually.",
      timeComplexity: "O(1)", spaceComplexity: "O(capacity)", language: "Python",
      nextReview: daysAgo(1), reviewInterval: 7, reviewCount: 2, lastReviewedAt: daysAgo(8) },

    { userId, topicId: null, title: "Find Median from Data Stream", platform: "LeetCode", problemNumber: "295",
      url: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "hard", status: "unsolved",
      tags: ["heap", "design"], notes: "", timeComplexity: "", spaceComplexity: "", language: "" },
  ]);

  // ── Study Sessions ─────────────────────────────────────────────────────────────

  const sessionData = [
    // Last 14 days — variety of types and topics
    { daysBack: 0,  topicId: arrays._id,        activityType: "flashcard", duration: 15 },
    { daysBack: 0,  topicId: dp._id,             activityType: "quiz",      duration: 20, score: 67 },
    { daysBack: 1,  topicId: twoPointers._id,    activityType: "flashcard", duration: 12 },
    { daysBack: 1,  topicId: caching._id,        activityType: "note",      duration: 1  },
    { daysBack: 2,  topicId: arrays._id,         activityType: "quiz",      duration: 18, score: 100 },
    { daysBack: 2,  topicId: slidingWindow._id,  activityType: "note",      duration: 1  },
    { daysBack: 3,  topicId: dp._id,             activityType: "flashcard", duration: 25 },
    { daysBack: 4,  topicId: caching._id,        activityType: "quiz",      duration: 22, score: 33 },
    { daysBack: 4,  topicId: arrays._id,         activityType: "review",    duration: 10 },
    { daysBack: 5,  topicId: star._id,           activityType: "flashcard", duration: 8  },
    { daysBack: 6,  topicId: twoPointers._id,    activityType: "quiz",      duration: 15, score: 100 },
    { daysBack: 7,  topicId: arrays._id,         activityType: "flashcard", duration: 20 },
    { daysBack: 8,  topicId: leadership._id,     activityType: "note",      duration: 1  },
    { daysBack: 9,  topicId: dp._id,             activityType: "quiz",      duration: 30, score: 67 },
    { daysBack: 10, topicId: slidingWindow._id,  activityType: "flashcard", duration: 10 },
    { daysBack: 11, topicId: caching._id,        activityType: "flashcard", duration: 18 },
    { daysBack: 12, topicId: star._id,           activityType: "quiz",      duration: 12, score: 100 },
    { daysBack: 13, topicId: trees._id,          activityType: "note",      duration: 1  },
    { daysBack: 14, topicId: dsa._id,            activityType: "review",    duration: 30 },
  ];

  const sessionDocs = sessionData.map(({ daysBack, topicId, activityType, duration, score }) => ({
    userId, topicId, activityType, duration, ...(score !== undefined ? { score } : {}),
    createdAt: daysAgo(daysBack),
  }));
  await StudySession.insertMany(sessionDocs);

  // ── Update stats ──────────────────────────────────────────────────────────────

  const allTopicIds = [dsa._id, sysdesign._id, behavioral._id,
                       arrays._id, twoPointers._id, slidingWindow._id, dp._id, trees._id,
                       caching._id, databases._id, star._id, leadership._id];

  await Promise.all(allTopicIds.map(async (tid) => {
    const [notesCount, flashcardsCount, quizzesCount] = await Promise.all([
      Note.countDocuments({ topicId: tid }),
      Flashcard.countDocuments({ topicId: tid }),
      Quiz.countDocuments({ topicId: tid }),
    ]);
    await Topic.updateOne({ _id: tid }, { $set: { "stats.notesCount": notesCount,
      "stats.flashcardsCount": flashcardsCount, "stats.quizzesCount": quizzesCount } });
  }));

  // ── User 2 data ───────────────────────────────────────────────────────────────

  const userId2 = user2._id;

  const [u2frontend, u2backend] = await Topic.insertMany([
    { name: "Frontend", slug: slugify("Frontend-alex"),
      description: "React, TypeScript, performance.",
      level: 0, parentId: null, path: [], status: "in-progress",
      tags: ["frontend", "react"], favorite: true, isPublic: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 60 }, userId: userId2 },

    { name: "Backend", slug: slugify("Backend-alex"),
      description: "Node.js, REST APIs, databases.",
      level: 0, parentId: null, path: [], status: "not-started",
      tags: ["backend", "node"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 20 }, userId: userId2 },
  ]);

  const [u2react, u2perf] = await Topic.insertMany([
    { name: "React Hooks", slug: slugify("React Hooks-alex"),
      description: "useState, useEffect, useContext, custom hooks.",
      level: 1, parentId: u2frontend._id, path: [u2frontend._id], status: "mastered",
      tags: ["react", "hooks"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 100 }, userId: userId2 },

    { name: "Performance", slug: slugify("Performance-alex"),
      description: "Memoization, lazy loading, bundle optimization.",
      level: 1, parentId: u2frontend._id, path: [u2frontend._id], status: "in-progress",
      tags: ["performance"], favorite: false,
      stats: { notesCount: 0, flashcardsCount: 0, quizzesCount: 0, completionPercentage: 50 }, userId: userId2 },
  ]);

  await Note.insertMany([
    { topicId: u2react._id, title: "useEffect Cheatsheet",
      content: "# useEffect\n\n## Runs after every render\n```js\nuseEffect(() => { ... });\n```\n## Runs once (mount)\n```js\nuseEffect(() => { ... }, []);\n```\n## Runs when dep changes\n```js\nuseEffect(() => { ... }, [dep]);\n```\n## Cleanup\n```js\nuseEffect(() => {\n  const sub = subscribe();\n  return () => sub.unsubscribe();\n}, []);\n```",
      pinned: true, tags: ["react", "hooks"], userId: userId2 },

    { topicId: u2perf._id, title: "React Performance Tricks",
      content: "# React Performance\n\n- `React.memo` — skip re-render if props unchanged\n- `useMemo` — memoize expensive computation\n- `useCallback` — stable function reference for child props\n- Code splitting: `React.lazy` + `Suspense`\n- Avoid inline object/function props in JSX",
      pinned: false, tags: ["performance", "react"], userId: userId2 },

    { topicId: u2backend._id, title: "REST API Design Notes",
      content: "# REST API Design\n\n## Status Codes\n- 200 OK, 201 Created, 204 No Content\n- 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found\n- 500 Internal Server Error\n\n## Naming\n- Use nouns not verbs: `/users` not `/getUsers`\n- Use plural: `/users/:id`\n- Nest for relationships: `/users/:id/posts`",
      pinned: false, tags: ["api", "rest"], userId: userId2 },
  ]);

  await Flashcard.insertMany([
    { topicId: u2react._id, front: "When does useEffect run?", back: "After every render by default. Pass [] to run only on mount. Pass [dep] to run when dep changes.",
      tags: ["react", "hooks"], difficulty: "easy", status: "review", confidence: "easy",
      reviewCount: 3, intervalDays: 5, easeFactor: 2.6, lastReviewed: daysAgo(2), nextReview: daysFrom(3), userId: userId2 },
    { topicId: u2react._id, front: "What is the difference between useMemo and useCallback?", back: "useMemo memoizes a computed value. useCallback memoizes a function reference. Both take a dependency array.",
      tags: ["react", "performance"], difficulty: "medium", status: "learning", confidence: "medium",
      reviewCount: 1, intervalDays: 2, easeFactor: 2.4, lastReviewed: daysAgo(1), nextReview: daysFrom(1), userId: userId2 },
    { topicId: u2perf._id, front: "What does React.memo do?", back: "Wraps a component to skip re-rendering if props haven't changed (shallow comparison).",
      tags: ["performance"], difficulty: "easy", status: "new", confidence: "medium",
      reviewCount: 0, intervalDays: 0, easeFactor: 2.5, userId: userId2 },
  ]);

  await Quiz.insertMany([
    { topicId: u2react._id, title: "React Hooks Quiz", description: "Test your hooks knowledge.",
      difficulty: "easy", type: "multiple-choice", tags: ["react"],
      questions: [
        { id: "q-u2-1", question: "Which hook replaces componentDidMount?",
          options: ["useState", "useRef", "useEffect with []", "useContext"], correctAnswer: 2,
          explanation: "useEffect with an empty dependency array runs once after the initial render.", points: 1, tags: [] },
        { id: "q-u2-2", question: "What does useCallback return?",
          options: ["A memoized value", "A memoized function", "A ref object", "A context value"], correctAnswer: 1,
          explanation: "useCallback returns a memoized version of the callback that only changes if dependencies change.", points: 1, tags: [] },
      ],
      shuffleQuestions: false, shuffleOptions: false, showAnswersImmediately: false, userId: userId2 },
  ]);

  await Problem.insertMany([
    { userId: userId2, topicId: u2react._id, title: "Debounce Function", platform: "Custom",
      difficulty: "medium", status: "solved",
      tags: ["javascript", "closures"], notes: "Use closure to hold timer. clearTimeout on each call, setTimeout at end.",
      timeComplexity: "O(1)", spaceComplexity: "O(1)", language: "JavaScript",
      nextReview: daysAgo(1), reviewInterval: 7, reviewCount: 2, lastReviewedAt: daysAgo(8) },
    { userId: userId2, topicId: u2perf._id, title: "Flatten Nested Array", platform: "Custom",
      difficulty: "easy", status: "solved",
      tags: ["arrays", "recursion"], notes: "Array.flat(Infinity) or recursive reduce.",
      timeComplexity: "O(n)", spaceComplexity: "O(n)", language: "JavaScript",
      nextReview: daysFrom(4), reviewInterval: 7, reviewCount: 1, lastReviewedAt: daysAgo(3) },
    { userId: userId2, topicId: null, title: "Implement Promise.all", platform: "Custom",
      difficulty: "hard", status: "attempted",
      tags: ["promises", "async"], notes: "Counter for resolved count. Reject on first rejection.",
      timeComplexity: "O(n)", spaceComplexity: "O(n)", language: "JavaScript" },
  ]);

  await StudySession.insertMany([
    { userId: userId2, topicId: u2react._id, activityType: "flashcard", duration: 10, createdAt: daysAgo(0) },
    { userId: userId2, topicId: u2react._id, activityType: "quiz",      duration: 8, score: 100, createdAt: daysAgo(1) },
    { userId: userId2, topicId: u2perf._id,  activityType: "note",      duration: 1, createdAt: daysAgo(2) },
    { userId: userId2, topicId: u2backend._id, activityType: "note",    duration: 1, createdAt: daysAgo(3) },
    { userId: userId2, topicId: u2react._id, activityType: "review",    duration: 15, createdAt: daysAgo(4) },
    { userId: userId2, topicId: u2react._id, activityType: "flashcard", duration: 12, createdAt: daysAgo(5) },
  ]);

  // Update user2 topic stats
  const u2TopicIds = [u2frontend._id, u2backend._id, u2react._id, u2perf._id];
  await Promise.all(u2TopicIds.map(async (tid) => {
    const [notesCount, flashcardsCount, quizzesCount] = await Promise.all([
      Note.countDocuments({ topicId: tid }),
      Flashcard.countDocuments({ topicId: tid }),
      Quiz.countDocuments({ topicId: tid }),
    ]);
    await Topic.updateOne({ _id: tid }, { $set: { "stats.notesCount": notesCount,
      "stats.flashcardsCount": flashcardsCount, "stats.quizzesCount": quizzesCount } });
  }));

  // ── Summary ───────────────────────────────────────────────────────────────────

  console.log("\n✅ Sample data seeded:");
  console.log("─────────────────────────────────────────");
  console.log("   USER 1 — Sample User");
  console.log(`   👤 Email:            ${SAMPLE_USER_EMAIL}`);
  console.log(`   🔑 Password:         ${SAMPLE_USER_PASSWORD}`);
  console.log(`   📁 Root topics:      3 (DSA ⭐, System Design ⭐, Behavioral)`);
  console.log(`   📂 Subtopics:        ${[arrays,twoPointers,slidingWindow,dp,trees,caching,databases,star,leadership].length}`);
  console.log(`   📝 Notes:            ${notes.length} (2 pinned)`);
  console.log(`   🃏 Flashcards:       ${flashcards.length}`);
  console.log(`   🧠 Quizzes:          ${quizzes.length} (3 questions each)`);
  console.log(`   💻 Problems:         ${problems.length} (5 due for review)`);
  console.log(`   📊 Study sessions:   ${sessionDocs.length} (last 14 days)`);
  console.log("─────────────────────────────────────────");
  console.log("   USER 2 — Alex Dev");
  console.log(`   👤 Email:            ${SAMPLE_USER2_EMAIL}`);
  console.log(`   🔑 Password:         ${SAMPLE_USER2_PASSWORD}`);
  console.log("   📁 Root topics:      2 (Frontend ⭐, Backend)");
  console.log("   📂 Subtopics:        2 (React Hooks, Performance)");
  console.log("   📝 Notes:            3 (1 pinned)");
  console.log("   🃏 Flashcards:       3");
  console.log("   🧠 Quizzes:          1");
  console.log("   💻 Problems:         3 (1 due for review)");
  console.log("   📊 Study sessions:   6");
  console.log("─────────────────────────────────────────");
  console.log("\n   What to test:");
  console.log("   • Login as User 1 — full DSA + System Design data");
  console.log("   • Login as User 2 — completely separate Frontend data");
  console.log("   • Data isolation — each user sees only their own content");
  console.log("   • Pinned Notes — User 1 has 2, User 2 has 1");
  console.log("   • Problems › Review Queue — User 1 has 5 due");
  console.log("   • Favorites — User 1: DSA + System Design, User 2: Frontend");
  console.log("   • Flashcard study / Quiz — try both accounts");

  await mongoose.disconnect();
  console.log("\n👋 Disconnected from MongoDB");
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message || err);
  mongoose.disconnect().catch(() => {}).finally(() => process.exit(1));
});
