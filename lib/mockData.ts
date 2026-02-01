export interface Topic {
  id: string;
  name: string;
  slug?: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  name: string;
  slug?: string;
  count: number;
  subtopics?: Subtopic[]; // Support nested subtopics
}

export interface SubtopicDetail {
  id: string;
  name: string;
  description: string;
  flashcards: number;
  quizzes: number;
  notes: number;
  subtopics?: SubtopicDetail[]; // Support nested subtopics
}

export interface Note {
  id: string;
  content: string;
  date: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Quiz {
  id: string;
  title: string;
  source: string;
  date: string;
  lastScore?: string;
  lastAttemptDate?: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple-choice" | "true-false" | "mixed";
  timeLimit?: number;
  tags: string[];
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
}

export const mockTopics: Topic[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    subtopics: [
      {
        id: "arrays",
        name: "Arrays",
        count: 12,
        subtopics: [
          { id: "array-basics", name: "Array Basics", count: 5 },
          { id: "array-sorting", name: "Sorting Algorithms", count: 4 },
          { id: "array-searching", name: "Searching Algorithms", count: 3 },
        ],
      },
      {
        id: "linked-lists",
        name: "Linked Lists",
        count: 8,
        subtopics: [
          { id: "singly-linked", name: "Singly Linked Lists", count: 3 },
          { id: "doubly-linked", name: "Doubly Linked Lists", count: 3 },
          { id: "circular-linked", name: "Circular Linked Lists", count: 2 },
        ],
      },
      {
        id: "trees",
        name: "Trees",
        count: 15,
        subtopics: [
          { id: "binary-trees", name: "Binary Trees", count: 5 },
          { id: "bst", name: "Binary Search Trees", count: 4 },
          { id: "avl-trees", name: "AVL Trees", count: 3 },
          { id: "red-black", name: "Red-Black Trees", count: 3 },
        ],
      },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    subtopics: [],
  },
  {
    id: "behavioral",
    name: "Behavioral Interview",
    subtopics: [],
  },
];

export const mockSubtopics: SubtopicDetail[] = [
  {
    id: "arrays",
    name: "Arrays",
    description:
      "Linear data structure storing elements in contiguous memory locations. Time complexity for access is O(1).",
    flashcards: 12,
    quizzes: 3,
    notes: 8,
    subtopics: [
      {
        id: "array-basics",
        name: "Array Basics",
        description: "Fundamentals of arrays, indexing, and basic operations.",
        flashcards: 5,
        quizzes: 1,
        notes: 3,
      },
      {
        id: "array-sorting",
        name: "Sorting Algorithms",
        description:
          "QuickSort, MergeSort, BubbleSort, and other sorting techniques.",
        flashcards: 4,
        quizzes: 1,
        notes: 3,
      },
      {
        id: "array-searching",
        name: "Searching Algorithms",
        description: "Binary search, linear search, and search optimizations.",
        flashcards: 3,
        quizzes: 1,
        notes: 2,
      },
    ],
  },
  {
    id: "linked-lists",
    name: "Linked Lists",
    description:
      "Dynamic data structure with nodes containing data and references. Efficient insertions and deletions.",
    flashcards: 8,
    quizzes: 2,
    notes: 5,
    subtopics: [
      {
        id: "singly-linked",
        name: "Singly Linked Lists",
        description: "Basic linked list with single direction pointers.",
        flashcards: 3,
        quizzes: 1,
        notes: 2,
      },
      {
        id: "doubly-linked",
        name: "Doubly Linked Lists",
        description: "Linked lists with forward and backward pointers.",
        flashcards: 3,
        quizzes: 1,
        notes: 2,
      },
      {
        id: "circular-linked",
        name: "Circular Linked Lists",
        description: "Linked lists where last node points to first.",
        flashcards: 2,
        quizzes: 0,
        notes: 1,
      },
    ],
  },
  {
    id: "trees",
    name: "Trees",
    description:
      "Hierarchical data structure with root, nodes, and leaves. Binary trees, BST, AVL, and more.",
    flashcards: 15,
    quizzes: 4,
    notes: 12,
    subtopics: [
      {
        id: "binary-trees",
        name: "Binary Trees",
        description: "Trees where each node has at most two children.",
        flashcards: 5,
        quizzes: 1,
        notes: 4,
      },
      {
        id: "bst",
        name: "Binary Search Trees",
        description:
          "Binary trees with ordered node values for efficient searching.",
        flashcards: 4,
        quizzes: 1,
        notes: 3,
      },
      {
        id: "avl-trees",
        name: "AVL Trees",
        description: "Self-balancing binary search trees.",
        flashcards: 3,
        quizzes: 1,
        notes: 3,
      },
      {
        id: "red-black",
        name: "Red-Black Trees",
        description: "Self-balancing BST with color properties.",
        flashcards: 3,
        quizzes: 1,
        notes: 2,
      },
    ],
  },
  {
    id: "graphs",
    name: "Graphs",
    description:
      "Non-linear structure with vertices and edges. Used for networks, paths, and relationships.",
    flashcards: 10,
    quizzes: 2,
    notes: 6,
  },
];

export const mockNotes: Note[] = [
  {
    id: "1",
    content: `# Key Concepts to Remember

- **Time complexity analysis** is crucial for interviews
- Always consider **space complexity** trade-offs
- Practice identifying patterns in problems
- Master the fundamentals before moving to advanced topics

> "The key to success is understanding the problem deeply before coding."`,
    date: "Jan 8, 2025",
  },
  {
    id: "2",
    content: `## Big-O Notation Cheat Sheet

| Complexity | Name | Example |
|------------|------|---------|
| O(1) | Constant | Array access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Single loop |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Nested loops |
| O(2^n) | Exponential | Recursive fibonacci |

\`\`\`python
# Example: Binary Search - O(log n)
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\``,
    date: "Jan 7, 2025",
  },
  {
    id: "3",
    content: `## Common Interview Patterns

### 1. Sliding Window
For array/string problems with contiguous subarrays

**When to use:**
- Maximum/minimum sum of subarray of size k
- Longest substring without repeating characters
- String permutation problems

### 2. Two Pointers
For sorted arrays, finding pairs

**Examples:**
- Two sum in sorted array
- Remove duplicates
- Container with most water

### 3. Fast & Slow Pointers
Cycle detection in linked lists

**Use cases:**
- Finding middle of linked list
- Detecting cycles
- Finding start of cycle`,
    date: "Jan 6, 2025",
  },
];

export const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    front: "What is the time complexity of binary search?",
    back: "O(log n) - Divides search space in half each iteration",
  },
  {
    id: "2",
    front: "What data structure uses LIFO?",
    back: "Stack - Last In, First Out principle",
  },
  {
    id: "3",
    front: "Difference between DFS and BFS?",
    back: "DFS uses stack (recursive), explores depth first. BFS uses queue, explores level by level",
  },
  {
    id: "4",
    front: "What is a hash collision?",
    back: "When two different keys hash to the same index. Resolved by chaining or open addressing",
  },
  {
    id: "5",
    front: "Best case time complexity of QuickSort?",
    back: "O(n log n) when pivot divides array evenly",
  },
  {
    id: "6",
    front: "What is a balanced tree?",
    back: "A tree where left and right subtree heights differ by at most 1 for all nodes (AVL, Red-Black)",
  },
];

export const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "Array Manipulation Problems",
    source: "LeetCode",
    date: "Jan 8, 2025",
    lastScore: "85%",
    lastAttemptDate: "Jan 28, 2026",
    description:
      "10 questions covering two-pointer technique, sliding window, and prefix sums. Focus on medium difficulty problems.",
    difficulty: "medium",
    type: "multiple-choice",
    timeLimit: 30,
    tags: ["arrays", "two-pointers", "sliding-window"],
    questions: [
      {
        id: "q1",
        question:
          "What is the time complexity of finding an element in an unsorted array?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 2,
        explanation:
          "In an unsorted array, you need to check each element in worst case, making it O(n).",
      },
      {
        id: "q2",
        question:
          "Which technique is best for finding maximum sum of k consecutive elements?",
        options: [
          "Two Pointers",
          "Sliding Window",
          "Binary Search",
          "Divide & Conquer",
        ],
        correctAnswer: 1,
        explanation:
          "Sliding window maintains a window of k elements and slides through the array efficiently.",
      },
      {
        id: "q3",
        question: "What is the space complexity of in-place array reversal?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 0,
        explanation:
          "In-place reversal uses two pointers and swaps elements without extra space.",
      },
    ],
  },
  {
    id: "2",
    title: "Binary Search Trees",
    source: "HackerRank",
    date: "Jan 6, 2025",
    lastScore: "70%",
    lastAttemptDate: "Jan 15, 2026",
    description:
      "8 questions on BST operations, validation, and traversals. Includes implementation questions.",
    difficulty: "hard",
    type: "multiple-choice",
    timeLimit: 45,
    tags: ["trees", "BST", "recursion"],
    questions: [
      {
        id: "q1",
        question: "What property must a Binary Search Tree satisfy?",
        options: [
          "All left children < parent, all right children > parent",
          "Complete binary tree",
          "Height balanced",
          "All nodes have two children",
        ],
        correctAnswer: 0,
        explanation:
          "BST requires left subtree values to be less than parent and right subtree values to be greater.",
      },
      {
        id: "q2",
        question: "What is the time complexity of searching in a balanced BST?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 1,
        explanation:
          "In a balanced BST, each comparison eliminates half the remaining nodes.",
      },
    ],
  },
  {
    id: "3",
    title: "Graph Algorithms Practice",
    source: "Own Creation",
    date: "Jan 4, 2025",
    description:
      "12 questions covering DFS, BFS, Dijkstra's algorithm, and topological sort. Mix of theory and code.",
    difficulty: "easy",
    type: "mixed",
    tags: ["graphs", "DFS", "BFS", "algorithms"],
    questions: [
      {
        id: "q1",
        question: "Which data structure does BFS use?",
        options: ["Stack", "Queue", "Heap", "Array"],
        correctAnswer: 1,
        explanation:
          "BFS explores level by level using a queue to maintain the order.",
      },
      {
        id: "q2",
        question: "What does DFS use for traversal?",
        options: ["Queue", "Array", "Stack or Recursion", "Hash Table"],
        correctAnswer: 2,
        explanation:
          "DFS goes deep into the graph using either explicit stack or recursion call stack.",
      },
    ],
  },
];
