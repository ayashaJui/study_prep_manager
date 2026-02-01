# Interview & Study Prep Manager
## Complete Implementation Plan & Feature Specification

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Hierarchical Structure Example](#hierarchical-structure-example)
4. [Phase-wise Implementation Plan](#phase-wise-implementation-plan)
5. [Detailed Feature Specifications](#detailed-feature-specifications)
6. [Technical Architecture](#technical-architecture)
7. [Data Structure](#data-structure)
8. [User Workflows](#user-workflows)

---

## Project Overview

### Vision
A comprehensive, hierarchical study management system designed for interview preparation and continuous learning. Supports infinite nesting of topics, with each level having its own notes, flashcards, and quizzes.

### Core Principles
- **Hierarchical Organization**: Unlimited nesting depth
- **Granular Resources**: Each subtopic has independent study materials
- **Dynamic & Editable**: All content can be modified anytime
- **Offline-First**: Works without internet, data stored locally
- **Progressive Enhancement**: Start simple, add features incrementally
- **Personal & Secure**: User authentication required for content management
- **Public Reading**: Anyone can view content, but only authenticated users can modify

### Authentication & Authorization
- **Login Required**: Users must log in to add, edit, or delete any content
- **Login Button**: Prominent login button in the header for easy access
- **Public Read Access**: All content is viewable without authentication
- **Protected Write Access**: Create, update, and delete operations require authentication
- **User-Specific Data**: Each user manages their own personal study content

---

## Authentication & Authorization

### Access Control Model

#### Public Actions (No Login Required)
- ✅ **View** all topics and subtopics
- ✅ **Read** all notes, summaries, flashcards, and quizzes
- ✅ **Navigate** through the hierarchy
- ✅ **Search** content
- ✅ **Study** flashcards (flip, browse)
- ✅ **Take** quizzes (attempt, see results)
- ✅ **Filter** and sort content
- ✅ **Expand/collapse** topic tree

#### Protected Actions (Login Required)
- 🔒 **Create** topics, subtopics
- 🔒 **Edit** topic/subtopic names
- 🔒 **Delete** topics, subtopics
- 🔒 **Add** notes, flashcards, quizzes
- 🔒 **Edit** notes, flashcards, quizzes
- 🔒 **Delete** notes, flashcards, quizzes
- 🔒 **Update** summaries
- 🔒 **Change** status (Not Started, In Progress, etc.)
- 🔒 **Add/remove** tags
- 🔒 **Mark** favorites
- 🔒 **Track** progress
- 🔒 **Export/Import** data

### User Experience Flow

#### For Unauthenticated Users
1. **Browse freely**: Can view all content without restrictions
2. **Attempt modifications**: See disabled buttons or "Login to Edit" prompts
3. **Click protected action**: Redirected to login page with return URL
4. **After login**: Return to original location, can now perform action

#### For Authenticated Users
1. **Full access**: All create, edit, delete buttons are enabled
2. **Personal workspace**: Data is saved under their user ID
3. **User menu**: Access to profile, settings, and logout
4. **Auto-save**: Changes persist automatically to their account

### Authentication Implementation

#### Recommended Authentication Provider
Choose one of the following:

**Option 1: Firebase Authentication** (Recommended for beginners)
- ✅ Easy setup with React
- ✅ Free tier: 10k/month authentications
- ✅ Integrates seamlessly with Firestore
- ✅ Supports Google, Email/Password, GitHub login
- ✅ Built-in UI components available

**Option 2: Supabase Auth**
- ✅ Open-source alternative to Firebase
- ✅ PostgreSQL database included
- ✅ Generous free tier
- ✅ Row-level security for data protection
- ✅ Supports multiple auth providers

**Option 3: Auth0**
- ✅ Enterprise-grade security
- ✅ Extensive customization
- ✅ Free tier: 7000 active users
- ✅ Social login providers

#### Implementation Checklist

**Setup Tasks:**
- [ ] Choose authentication provider (Firebase/Supabase/Auth0)
- [ ] Set up authentication project
- [ ] Configure OAuth providers (Google, GitHub, etc.)
- [ ] Install authentication SDK
- [ ] Create authentication context/hook
- [ ] Set up protected route wrapper

**UI Components:**
- [ ] Login button in header (always visible)
- [ ] Login modal/page
- [ ] Sign up modal/page
- [ ] User menu dropdown (logged in state)
- [ ] Logout functionality
- [ ] Password reset flow
- [ ] Loading states during auth checks

**Security Features:**
- [ ] Secure token storage
- [ ] Auto-refresh tokens
- [ ] Session timeout handling
- [ ] Redirect after login to original page
- [ ] Protect API calls with auth tokens
- [ ] Database security rules (Firestore/Supabase)

**User Feedback:**
- [ ] Toast notifications for login/logout
- [ ] Visual indicators for protected actions
- [ ] "Login to continue" prompts on write actions
- [ ] Disabled state styling for protected buttons
- [ ] Helpful error messages for auth failures

### Data Ownership Model

```javascript
// Each data item belongs to a user
{
  id: "topic-123",
  userId: "user-abc-456", // Owner of this content
  name: "JavaScript Fundamentals",
  createdAt: "2025-01-10",
  // ... other fields
}
```

#### Database Rules Example (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Topics collection
    match /topics/{topicId} {
      // Anyone can read
      allow read: if true;
      
      // Only authenticated users can create
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Only owner can update/delete
      allow update, delete: if request.auth != null 
                             && resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Database Rules Example (Supabase RLS)

```sql
-- Enable Row Level Security
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Public read access"
  ON topics FOR SELECT
  USING (true);

-- Authenticated users can insert their own data
CREATE POLICY "Users can create their own topics"
  ON topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update their own topics"
  ON topics FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "Users can delete their own topics"
  ON topics FOR DELETE
  USING (auth.uid() = user_id);
```

### UI State Examples

#### Login Button States

**Not Logged In:**
```jsx
<Header>
  <Logo />
  <SearchBar />
  <LoginButton>Login</LoginButton>
</Header>
```

**Logged In:**
```jsx
<Header>
  <Logo />
  <SearchBar />
  <UserMenu>
    <Avatar src={user.photoURL} />
    <Dropdown>
      <MenuItem>Profile</MenuItem>
      <MenuItem>Settings</MenuItem>
      <MenuItem onClick={logout}>Logout</MenuItem>
    </Dropdown>
  </UserMenu>
</Header>
```

#### Protected Button Examples

**Not Logged In:**
```jsx
<Button 
  onClick={() => showLoginPrompt()}
  variant="outlined"
  disabled
>
  🔒 Add Topic (Login Required)
</Button>
```

**Logged In:**
```jsx
<Button 
  onClick={() => createTopic()}
  variant="primary"
>
  ➕ Add Topic
</Button>
```

---

## Hierarchical Structure Example

### Example 1: Software Engineering Interview Prep

```
📚 Software Engineering Interview Prep (Root Topic)
│
├── 💾 Data Structures & Algorithms (Topic Level 1)
│   ├── 📝 Notes: Overview of DSA importance
│   ├── 🎴 Flashcards: Big-O notation cards (15 cards)
│   ├── 📋 Quizzes: General complexity analysis quiz
│   │
│   ├── 📂 Arrays (Subtopic Level 2)
│   │   ├── 📝 Notes: Array fundamentals, time complexities
│   │   ├── 🎴 Flashcards: Array operations (10 cards)
│   │   ├── 📋 Quizzes: Array manipulation problems
│   │   │
│   │   ├── 📄 Two Pointer Technique (Subtopic Level 3)
│   │   │   ├── 📝 Notes: Pattern explanation, when to use
│   │   │   ├── 🎴 Flashcards: Problem identification cards
│   │   │   └── 📋 Quizzes: 5 LeetCode problems
│   │   │
│   │   ├── 📄 Sliding Window (Subtopic Level 3)
│   │   │   ├── 📝 Notes: Fixed vs dynamic window
│   │   │   ├── 🎴 Flashcards: Window patterns
│   │   │   └── 📋 Quizzes: Practice problems
│   │   │
│   │   └── 📄 Prefix Sum (Subtopic Level 3)
│   │       ├── 📝 Notes: Formula and applications
│   │       └── 🎴 Flashcards: Quick calculation drills
│   │
│   ├── 📂 Linked Lists (Subtopic Level 2)
│   │   ├── 📝 Notes: Node structure, types
│   │   ├── 🎴 Flashcards: Pointer manipulation (12 cards)
│   │   │
│   │   ├── 📄 Singly Linked List (Subtopic Level 3)
│   │   │   ├── 📝 Notes: Operations (insert, delete, traverse)
│   │   │   ├── 📋 Quizzes: Implementation problems
│   │   │   │
│   │   │   └── 📄 Reversal Techniques (Subtopic Level 4)
│   │   │       ├── 📝 Notes: Iterative vs recursive
│   │   │       ├── 🎴 Flashcards: Code pattern cards
│   │   │       └── 📋 Quizzes: Reversal variations
│   │   │
│   │   ├── 📄 Doubly Linked List (Subtopic Level 3)
│   │   │   └── 📝 Notes: Bidirectional traversal
│   │   │
│   │   └── 📄 Circular Linked List (Subtopic Level 3)
│   │       └── 🎴 Flashcards: Detection algorithms
│   │
│   ├── 📂 Trees (Subtopic Level 2)
│   │   ├── 📝 Notes: Tree terminology, properties
│   │   ├── 🎴 Flashcards: Tree concepts (20 cards)
│   │   │
│   │   ├── 📄 Binary Trees (Subtopic Level 3)
│   │   │   ├── 📝 Notes: Structure, height, depth
│   │   │   │
│   │   │   ├── 📄 Traversals (Subtopic Level 4)
│   │   │   │   ├── 📝 Notes: DFS vs BFS overview
│   │   │   │   │
│   │   │   │   ├── 📄 Inorder (Subtopic Level 5)
│   │   │   │   │   ├── 📝 Notes: Left-Root-Right pattern
│   │   │   │   │   ├── 🎴 Flashcards: Output prediction
│   │   │   │   │   └── 📋 Quizzes: Implementation from scratch
│   │   │   │   │
│   │   │   │   ├── 📄 Preorder (Subtopic Level 5)
│   │   │   │   │   └── 📝 Notes: Root-Left-Right pattern
│   │   │   │   │
│   │   │   │   ├── 📄 Postorder (Subtopic Level 5)
│   │   │   │   │   └── 📝 Notes: Left-Right-Root pattern
│   │   │   │   │
│   │   │   │   └── 📄 Level Order (Subtopic Level 5)
│   │   │   │       ├── 📝 Notes: BFS implementation
│   │   │   │       └── 📋 Quizzes: Queue-based problems
│   │   │   │
│   │   │   └── 📄 Properties (Subtopic Level 4)
│   │   │       ├── 🎴 Flashcards: Height, depth, balanced
│   │   │       └── 📋 Quizzes: Calculate properties
│   │   │
│   │   └── 📄 Binary Search Tree (Subtopic Level 3)
│   │       ├── 📝 Notes: BST property, advantages
│   │       ├── 🎴 Flashcards: Valid BST questions
│   │       │
│   │       ├── 📄 Operations (Subtopic Level 4)
│   │       │   ├── 📄 Insert (Level 5)
│   │       │   ├── 📄 Delete (Level 5)
│   │       │   └── 📄 Search (Level 5)
│   │       │
│   │       └── 📄 Validation (Subtopic Level 4)
│   │           └── 📋 Quizzes: Validate BST problems
│   │
│   └── 📂 Graphs (Subtopic Level 2)
│       ├── 📝 Notes: Representations, types
│       ├── 🎴 Flashcards: Graph terminology
│       ├── 📄 DFS (Subtopic Level 3)
│       ├── 📄 BFS (Subtopic Level 3)
│       └── 📄 Shortest Path (Subtopic Level 3)
│           ├── 📄 Dijkstra (Level 4)
│           └── 📄 Bellman-Ford (Level 4)
│
├── 🖥️ System Design (Topic Level 1)
│   ├── 📝 Notes: Scalability fundamentals
│   ├── 🎴 Flashcards: Key concepts (25 cards)
│   │
│   ├── 📂 Scalability (Subtopic Level 2)
│   │   ├── 📝 Notes: Horizontal vs vertical scaling
│   │   │
│   │   ├── 📄 Load Balancing (Subtopic Level 3)
│   │   │   ├── 📝 Notes: Types of load balancers
│   │   │   ├── 🎴 Flashcards: Algorithms (Round Robin, etc.)
│   │   │   │
│   │   │   ├── 📄 Layer 4 vs Layer 7 (Subtopic Level 4)
│   │   │   │   └── 📝 Notes: Differences, use cases
│   │   │   │
│   │   │   └── 📄 Health Checks (Subtopic Level 4)
│   │   │       └── 🎴 Flashcards: Active vs passive
│   │   │
│   │   └── 📄 Caching (Subtopic Level 3)
│   │       ├── 📝 Notes: Cache benefits, trade-offs
│   │       ├── 🎴 Flashcards: Invalidation strategies
│   │       │
│   │       ├── 📄 Cache Strategies (Subtopic Level 4)
│   │       │   ├── 📄 LRU (Level 5)
│   │       │   │   ├── 📝 Notes: Implementation details
│   │       │   │   └── 📋 Quizzes: Code LRU cache
│   │       │   │
│   │       │   ├── 📄 LFU (Level 5)
│   │       │   └── 📄 FIFO (Level 5)
│   │       │
│   │       └── 📄 Cache Patterns (Subtopic Level 4)
│   │           ├── 📄 Write-Through (Level 5)
│   │           ├── 📄 Write-Back (Level 5)
│   │           └── 📄 Write-Around (Level 5)
│   │
│   ├── 📂 Databases (Subtopic Level 2)
│   │   ├── 📄 SQL vs NoSQL (Subtopic Level 3)
│   │   ├── 📄 Sharding (Subtopic Level 3)
│   │   ├── 📄 Replication (Subtopic Level 3)
│   │   └── 📄 CAP Theorem (Subtopic Level 3)
│   │       └── 🎴 Flashcards: Trade-off scenarios
│   │
│   └── 📂 Message Queues (Subtopic Level 2)
│       ├── 📄 Kafka (Subtopic Level 3)
│       └── 📄 RabbitMQ (Subtopic Level 3)
│
├── 💬 Behavioral Interview (Topic Level 1)
│   ├── 📝 Notes: STAR method framework
│   ├── 🎴 Flashcards: Common questions (30 cards)
│   │
│   ├── 📂 Leadership (Subtopic Level 2)
│   │   ├── 📝 Notes: Leadership stories from experience
│   │   ├── 📄 Difficult Decision (Level 3)
│   │   └── 📄 Team Conflict (Level 3)
│   │
│   ├── 📂 Problem Solving (Subtopic Level 2)
│   │   ├── 📄 Debugging Complex Issue (Level 3)
│   │   └── 📄 Innovative Solution (Level 3)
│   │
│   └── 📂 Failure Stories (Subtopic Level 2)
│       ├── 📝 Notes: 3 prepared failure stories
│       └── 🎴 Flashcards: Lessons learned
│
└── ⚛️ React (Topic Level 1)
    ├── 📝 Notes: React fundamentals
    ├── 🎴 Flashcards: Hooks, lifecycle (20 cards)
    │
    ├── 📂 Hooks (Subtopic Level 2)
    │   ├── 📝 Notes: Rules of hooks
    │   │
    │   ├── 📄 useState (Level 3)
    │   │   ├── 📝 Notes: State management basics
    │   │   ├── 🎴 Flashcards: Functional updates
    │   │   └── 📋 Quizzes: State update scenarios
    │   │
    │   ├── 📄 useEffect (Level 3)
    │   │   ├── 📝 Notes: Side effects, cleanup
    │   │   │
    │   │   ├── 📄 Dependency Array (Level 4)
    │   │   │   ├── 🎴 Flashcards: When effects run
    │   │   │   └── 📋 Quizzes: Predict behavior
    │   │   │
    │   │   └── 📄 Cleanup Function (Level 4)
    │   │       └── 📝 Notes: Memory leak prevention
    │   │
    │   ├── 📄 useContext (Level 3)
    │   ├── 📄 useReducer (Level 3)
    │   └── 📄 Custom Hooks (Level 3)
    │       └── 📋 Quizzes: Build custom hooks
    │
    └── 📂 Performance (Subtopic Level 2)
        ├── 📄 useMemo (Level 3)
        ├── 📄 useCallback (Level 3)
        └── 📄 React.memo (Level 3)
```

### Example 2: Medical School Study Plan

```
📚 Medical School - Year 2 (Root Topic)
│
├── 🫀 Cardiovascular System (Topic Level 1)
│   ├── 📝 Notes: System overview
│   ├── 🎴 Flashcards: Anatomy basics (50 cards)
│   │
│   ├── 📂 Anatomy (Subtopic Level 2)
│   │   ├── 📄 Heart Chambers (Level 3)
│   │   │   ├── 📝 Notes: Detailed anatomy
│   │   │   ├── 🎴 Flashcards: Valve locations
│   │   │   └── 📄 Blood Flow Path (Level 4)
│   │   │
│   │   └── 📄 Blood Vessels (Level 3)
│   │       ├── 📄 Arteries (Level 4)
│   │       └── 📄 Veins (Level 4)
│   │
│   ├── 📂 Physiology (Subtopic Level 2)
│   │   ├── 📄 Cardiac Cycle (Level 3)
│   │   │   ├── 📄 Systole (Level 4)
│   │   │   └── 📄 Diastole (Level 4)
│   │   │
│   │   └── 📄 ECG (Level 3)
│   │       ├── 📝 Notes: Wave interpretation
│   │       ├── 🎴 Flashcards: Normal values
│   │       └── 📋 Quizzes: ECG reading practice
│   │
│   └── 📂 Pathology (Subtopic Level 2)
│       ├── 📄 Myocardial Infarction (Level 3)
│       │   ├── 📝 Notes: Symptoms, diagnosis
│       │   └── 📋 Quizzes: Case studies
│       │
│       └── 📄 Heart Failure (Level 3)
│           ├── 📄 Systolic (Level 4)
│           └── 📄 Diastolic (Level 4)
│
└── 🧠 Neurology (Topic Level 1)
    └── ... (similar structure)
```

---

## Phase-wise Implementation Plan

### **PHASE 0: Foundation Setup (Week 1)**
**Goal**: Project structure and basic UI shell

#### Features:
- [ ] Project initialization (React + Vite/Create React App)
- [ ] Basic routing setup
- [ ] Main layout structure (Header with Login Button, Sidebar, Content Area)
- [ ] Color scheme and design tokens
- [ ] Icon library setup (Lucide React)
- [ ] Empty state designs
- [ ] Authentication setup (Firebase Auth / Supabase Auth / Auth0)
- [ ] Login/Signup UI components
- [ ] Protected route wrapper
- [ ] User context/state management

#### Deliverables:
- Running application with empty UI
- Navigation structure
- Design system basics
- Working authentication system
- Login button in header

---

### **PHASE 1: Core CRUD Operations (Week 2-3)**
**Goal**: Basic topic and subtopic management with authentication

#### 1.1 Topic Management (Authenticated Actions)
- [ ] Create topic (requires login - with form validation)
- [ ] View topic list in sidebar (public - no login required)
- [ ] Delete topic (requires login - with confirmation)
- [ ] Edit topic name (requires login)
- [ ] Topic selection highlighting
- [ ] Show login prompt for unauthenticated users on write actions

#### 1.2 Subtopic Management (Authenticated Actions)
- [ ] Add subtopic to any topic/subtopic (requires login)
- [ ] Recursive subtopic display (tree view - public)
- [ ] Expand/collapse subtopics (public)
- [ ] Delete subtopic (requires login - with confirmation)
- [ ] Edit subtopic name (requires login)
- [ ] Move/drag subtopics (requires login - optional for later)

#### 1.3 Data Persistence
- [ ] Cloud database integration (Firebase Firestore / Supabase)
- [ ] User-specific data storage (userId-based queries)
- [ ] Auto-save on changes
- [ ] Data validation
- [ ] Error handling for storage failures
- [ ] Read-only access for public users
- [ ] Write access only for authenticated users

#### 1.4 Navigation
- [ ] Breadcrumb navigation
- [ ] Click to navigate between levels
- [ ] Back button functionality
- [ ] Current location indicator

#### Deliverables:
- Full topic/subtopic hierarchy working
- Data persists in cloud database
- Intuitive navigation
- Authentication-protected write operations
- Public read access for all users

---

### **PHASE 2: Content Management (Week 4-5)**
**Goal**: Add notes, summaries, flashcards, and quizzes at every level (with authentication)

#### 2.1 Summary Feature (Authenticated Editing)
- [ ] Summary text area for each subtopic (viewable by all)
- [ ] Edit/save summary (requires login)
- [ ] Summary display in overview (public)
- [ ] Character count (optional)
- [ ] Show "Login to edit" for unauthenticated users

#### 2.2 Notes System (Authenticated Management)
- [ ] Add note with timestamp (requires login)
- [ ] Display notes list (public)
- [ ] Edit existing notes (requires login)
- [ ] Delete notes (requires login)
- [ ] Notes at both topic and subtopic level
- [ ] Multi-line text support
- [ ] Read-only view for non-authenticated users

#### 2.3 Flashcards (Authenticated Management)
- [ ] Create flashcard (front/back) (requires login)
- [ ] Display flashcard grid (public)
- [ ] Flip animation (public)
- [ ] Edit flashcard (requires login)
- [ ] Delete flashcard (requires login)
- [ ] Flashcards per topic/subtopic level
- [ ] Study mode available to all users

#### 2.4 Quizzes (Authenticated Management)
- [ ] Add quiz (title, questions, source) (requires login)
- [ ] Display quiz list (public)
- [ ] Edit quiz (requires login)
- [ ] Delete quiz (requires login)
- [ ] Date tracking
- [ ] Quizzes per topic/subtopic level
- [ ] Quiz taking available to all users

#### Deliverables:
- Complete content creation at any level (for authenticated users)
- All CRUD operations for each content type (protected by authentication)
- Clean, organized UI
- Clear visual indicators for login requirements
- Seamless read experience for all users

---

### **PHASE 3: Search & Organization (Week 6)**
**Goal**: Find content quickly and organize better

#### 3.1 Search Functionality
- [ ] Global search bar
- [ ] Search topics by name
- [ ] Search notes content
- [ ] Search flashcards
- [ ] Highlight search results
- [ ] Clear search

#### 3.2 Filtering
- [ ] Filter by content type (notes/flashcards/quizzes)
- [ ] Filter by status (if implemented)
- [ ] Date range filter

#### 3.3 Sorting
- [ ] Sort topics alphabetically
- [ ] Sort by date created
- [ ] Sort by last modified
- [ ] Custom ordering (drag & drop)

#### Deliverables:
- Fast content discovery
- Multiple ways to find information
- Organized content display

---

### **PHASE 4: Progress Tracking (Week 7-8)**
**Goal**: Track learning progress and completion

#### 4.1 Status Management
- [ ] Status field for each subtopic
- [ ] Status options: Not Started, In Progress, Review, Mastered
- [ ] Visual status indicators (colors/badges)
- [ ] Quick status toggle
- [ ] Status in tree view

#### 4.2 Progress Visualization
- [ ] Progress bar for each topic
- [ ] Calculate completion percentage
- [ ] Show completed vs total subtopics
- [ ] Progress in sidebar
- [ ] Overall progress dashboard

#### 4.3 Last Reviewed Tracking
- [ ] Track last review date
- [ ] Display "X days ago"
- [ ] Highlight items needing review
- [ ] Sort by last reviewed

#### 4.4 Statistics
- [ ] Total topics/subtopics count
- [ ] Total flashcards/quizzes count
- [ ] Study time tracking (optional)
- [ ] Completion statistics

#### Deliverables:
- Visual progress tracking
- Motivation through completion metrics
- Easy identification of what needs review

---

### **PHASE 5: Enhanced Study Features (Week 9-10)**
**Goal**: Make studying more effective

#### 5.1 Tagging System
- [ ] Add tags to topics/subtopics
- [ ] Tag input with autocomplete
- [ ] Tag filtering
- [ ] Tag cloud view
- [ ] Popular tags display
- [ ] Tag-based search

#### 5.2 Favorites/Bookmarks
- [ ] Star/favorite important items
- [ ] Favorites view
- [ ] Quick access to favorites
- [ ] Favorite flashcards
- [ ] Favorite quizzes

#### 5.3 Related Content
- [ ] Link related subtopics
- [ ] "See also" references
- [ ] Related content suggestions
- [ ] Cross-topic connections

#### 5.4 Study Mode
- [ ] Focus mode (hide sidebar)
- [ ] Full-screen view
- [ ] Distraction-free interface
- [ ] Keyboard shortcuts

#### Deliverables:
- Powerful organization with tags
- Quick access to important content
- Better study experience

---

### **PHASE 6: Flashcard Enhancement (Week 11)**
**Goal**: Advanced flashcard features

#### 6.1 Flashcard Study Mode
- [ ] Study session (one card at a time)
- [ ] Next/previous navigation
- [ ] Shuffle cards
- [ ] Study mode UI
- [ ] Session progress indicator

#### 6.2 Confidence Ratings
- [ ] Rate each card (Easy/Medium/Hard)
- [ ] Store confidence level
- [ ] Filter by confidence
- [ ] Visual confidence indicators

#### 6.3 Spaced Repetition (Basic)
- [ ] Track review history
- [ ] Calculate next review date
- [ ] "Due for review" indicator
- [ ] Review queue

#### 6.4 Flashcard Collections
- [ ] View all flashcards from a topic + subtopics
- [ ] Study entire topic tree
- [ ] Aggregate flashcard view
- [ ] Random selection from collection

#### Deliverables:
- Professional flashcard study experience
- Smart review scheduling
- Better retention through spaced repetition

---

### **PHASE 7: Quiz Enhancement (Week 12)**
**Goal**: Interactive quiz taking

#### 7.1 Quiz Taking Mode
- [ ] View quiz in take mode
- [ ] Answer input fields
- [ ] Submit quiz
- [ ] Score calculation
- [ ] Results display

#### 7.2 Quiz Types
- [ ] Multiple choice questions
- [ ] True/False questions
- [ ] Short answer
- [ ] Code output prediction

#### 7.3 Quiz Analytics
- [ ] Score history per quiz
- [ ] Average scores
- [ ] Track incorrect answers
- [ ] Review wrong answers
- [ ] Performance over time

#### 7.4 Timer Feature
- [ ] Optional quiz timer
- [ ] Practice under time pressure
- [ ] Time tracking per quiz

#### Deliverables:
- Full quiz-taking experience
- Performance tracking
- Identify weak areas

---

### **PHASE 8: Export & Backup (Week 13)**
**Goal**: Data portability and safety

#### 8.1 Export Features
- [ ] Export to JSON
- [ ] Export to Markdown
- [ ] Export to PDF (study guide)
- [ ] Export single topic
- [ ] Export entire database
- [ ] Anki-compatible export (flashcards)

#### 8.2 Import Features
- [ ] Import from JSON
- [ ] Import from Markdown
- [ ] Import Anki decks
- [ ] Merge vs replace options
- [ ] Import validation

#### 8.3 Backup System
- [ ] Auto-backup to localStorage
- [ ] Download backup file
- [ ] Restore from backup
- [ ] Backup versioning
- [ ] Backup reminder

#### Deliverables:
- Data safety
- Easy migration
- Share-able content

---

### **PHASE 9: UI/UX Polish (Week 14)**
**Goal**: Professional, intuitive interface

#### 9.1 Visual Enhancements
- [ ] Smooth animations
- [ ] Loading states
- [ ] Empty states with guidance
- [ ] Error states with solutions
- [ ] Success confirmations
- [ ] Tooltips

#### 9.2 Responsive Design
- [ ] Mobile layout
- [ ] Tablet layout
- [ ] Desktop optimization
- [ ] Touch-friendly controls
- [ ] Adaptive sidebar

#### 9.3 Dark Mode
- [ ] Dark theme
- [ ] Theme toggle
- [ ] Persist theme preference
- [ ] Smooth theme transition

#### 9.4 Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] Focus indicators
- [ ] Color contrast compliance

#### Deliverables:
- Beautiful, polished interface
- Works on all devices
- Accessible to all users

---

### **PHASE 10: Advanced Features (Week 15-16)**
**Goal**: Power user features

#### 10.1 Markdown Support
- [ ] Markdown editor for notes
- [ ] Syntax highlighting for code
- [ ] Preview mode
- [ ] Markdown cheatsheet
- [ ] Code block support

#### 10.2 Rich Content
- [ ] Image upload/embed
- [ ] Link support
- [ ] File attachments
- [ ] YouTube embed (optional)

#### 10.3 Templates
- [ ] Topic templates
- [ ] Note templates
- [ ] Quick start templates
- [ ] Template library

#### 10.4 Keyboard Shortcuts
- [ ] Quick add (Ctrl+N)
- [ ] Search (Ctrl+F)
- [ ] Navigate (Arrow keys)
- [ ] Shortcut help modal

#### 10.5 Dashboard
- [ ] Overview page
- [ ] Study statistics
- [ ] Recent activity
- [ ] Upcoming reviews
- [ ] Quick actions

#### Deliverables:
- Power user productivity features
- Rich content support
- Comprehensive dashboard

---

### **PHASE 11: Cloud & Sync (Week 17-18)** ⚠️ Advanced
**Goal**: Multi-device access

#### 11.1 Cloud Storage
- [ ] Firebase/Supabase integration
- [ ] User authentication
- [ ] Cloud save
- [ ] Cloud load
- [ ] Conflict resolution

#### 11.2 Sync Features
- [ ] Auto-sync
- [ ] Manual sync
- [ ] Sync status indicator
- [ ] Offline queue
- [ ] Last synced timestamp

#### 11.3 Multi-device
- [ ] Access from any device
- [ ] Device management
- [ ] Logout functionality

#### Deliverables:
- Cloud-based storage
- Seamless sync across devices
- Never lose data

---

### **PHASE 12: AI Features (Week 19-20)** ⚠️ Advanced
**Goal**: AI-powered study assistance

#### 12.1 Auto-Generation
- [ ] Generate flashcards from notes (AI)
- [ ] Generate quiz questions (AI)
- [ ] Summarize long notes (AI)
- [ ] Extract key concepts (AI)

#### 12.2 Smart Suggestions
- [ ] Related topic suggestions
- [ ] Study recommendations
- [ ] Gap analysis
- [ ] Content improvement suggestions

#### 12.3 AI Integration
- [ ] OpenAI API integration
- [ ] Anthropic API integration
- [ ] Local AI models (optional)
- [ ] API key management

#### Deliverables:
- AI-powered content creation
- Intelligent study recommendations
- Time-saving automation

---

## Detailed Feature Specifications

### 1. Topic/Subtopic Structure

**Data Model:**
```javascript
{
  id: "unique-id-123",
  name: "JavaScript",
  type: "topic", // or "subtopic"
  parentId: null, // null for root topics
  level: 1, // depth in hierarchy
  
  // Content
  summary: "Programming language...",
  notes: [
    {
      id: "note-1",
      content: "Note text...",
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-01-10T11:00:00Z"
    }
  ],
  flashcards: [
    {
      id: "card-1",
      front: "What is closure?",
      back: "A function that...",
      confidence: "medium", // easy, medium, hard
      lastReviewed: "2025-01-09",
      nextReview: "2025-01-12",
      reviewCount: 5
    }
  ],
  quizzes: [
    {
      id: "quiz-1",
      title: "Closures Quiz",
      questions: "1. What is...\n2. How does...",
      source: "LeetCode",
      createdAt: "2025-01-08",
      attempts: [
        {
          date: "2025-01-09",
          score: 85,
          timeTaken: 600 // seconds
        }
      ]
    }
  ],
  
  // Children
  subtopics: [
    // ... nested subtopic objects (same structure)
  ],
  
  // Metadata
  status: "in-progress", // not-started, in-progress, review, mastered
  tags: ["important", "interview-prep"],
  favorite: false,
  lastReviewed: "2025-01-09",
  createdAt: "2025-01-01",
  updatedAt: "2025-01-10",
  
  // Stats (calculated)
  totalFlashcards: 15, // including all subtopics
  totalQuizzes: 3,
  totalNotes: 8,
  completionPercentage: 60
}
```

### 2. Component Architecture

```
App
├── Header
│   ├── Logo
│   ├── GlobalSearch
│   ├── LoginButton (prominent, top-right)
│   └── UserMenu (authenticated: profile, settings, logout)
│
├── Sidebar
│   ├── SearchBar (public)
│   ├── AddTopicButton (protected: shows login prompt if not authenticated)
│   ├── TopicTree (recursive - public view)
│   │   └── TopicNode (recursive component)
│   │       ├── ExpandButton (public)
│   │       ├── TopicName (public)
│   │       ├── StatusBadge (public)
│   │       ├── ActionsMenu (protected: edit, delete - requires login)
│   │       └── SubtopicList (recursive)
│   └── FilterControls (public)
│
├── MainContent
│   ├── Breadcrumbs (public)
│   ├── TabNavigation (Overview, Notes, Flashcards, Quizzes - public)
│   │
│   ├── OverviewView
│   │   ├── TopicHeader
│   │   ├── SummarySection (protected editing, public view)
│   │   ├── SubtopicGrid (public)
│   │   ├── StatsCards (public)
│   │   └── QuickActions (protected: requires login)
│   │
│   ├── NotesView
│   │   ├── NoteEditor (protected: requires login)
│   │   ├── NoteList (public view)
│   │   └── NoteItem (protected editing, public view)
│   │
│   ├── FlashcardsView
│   │   ├── AddFlashcardForm (protected: requires login)
│   │   ├── StudyModeButton (public)
│   │   ├── FlashcardGrid (public view)
│   │   └── FlashcardItem (protected editing, public flipping)
│