# Interview & Study Prep Manager

A comprehensive, hierarchical study management system designed for interview preparation and continuous learning. Organize unlimited nested topics with integrated notes, flashcards, quizzes, and advanced study tools.

## 📋 Features

### Core Functionality
- **Hierarchical Organization**: Create unlimited nested topics and subtopics for organizing study material
- **Notes & Summaries**: Write and organize detailed notes with markdown support
- **Flashcards**: Create interactive flashcards with spaced repetition support
- **Quizzes**: Build customizable quizzes with multiple-choice questions, multi-answer support, and detailed explanations
- **Progress Tracking**: Monitor learning progress across topics and study sessions
- **Topic Management**: Create, edit, and organize topics with difficulty levels and tags

### Import & Export
- **File Import**: Import flashcards and quizzes from CSV files with flexible formatting
- **Bulk Operations**: Add multiple study materials at once with validation
- **Template Support**: Download templates for easy data preparation

### Advanced Features
- **Quiz Enhancements**: 
  - Multiple correct answers per question
  - Explanation field for each question
  - Time limits and difficulty levels
  - Score tracking and attempt history
  - Review mode with detailed feedback
- **Flashcard Features**:
  - Front/back format with rich text support
  - Difficulty tracking
  - Tag organization
  - Study mode for efficient learning
- **Search & Filter**: Find content quickly across your study materials
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd interview_prep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
MONGODB_URI=mongodb://localhost:27017/interview_prep
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Icons**: Lucide React
- **Markdown**: React Markdown with GFM support
- **UI Components**: Custom component library with Card, Button, Input, Modal, Tabs

## 📁 Project Structure

```
interview_prep/
├── app/                    # Next.js app directory
│   ├── api/               # API routes for CRUD operations
│   │   ├── flashcards/
│   │   ├── quizzes/
│   │   ├── notes/
│   │   └── topics/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── features/          # Feature components (FlashcardGrid, QuizList, etc.)
│   ├── layout/            # Layout components (Header, Sidebar, etc.)
│   ├── ui/               # Reusable UI components
│   └── views/            # Page views and modals
├── models/               # Mongoose schemas
│   ├── Quiz.ts
│   ├── Flashcard.ts
│   └── Note.ts
├── lib/                  # Utility functions and services
│   ├── api.ts           # API service layer
│   ├── db.ts            # MongoDB connection
│   └── errorHandler.ts
├── hooks/               # Custom React hooks
├── contexts/            # React contexts (Toast notifications)
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## 🎯 Usage

### Creating Study Materials

1. **Add a Topic**: Click "Add Topic" in the dashboard to create a new study area
2. **Create Subtopics**: Organize topics hierarchically by adding subtopics
3. **Add Notes**: Write detailed notes in markdown format for each topic
4. **Create Flashcards**: Build question-answer pairs for active recall learning
5. **Build Quizzes**: Create multiple-choice quizzes with answers and explanations

### Importing Data

1. Click "Import CSV" button on Flashcards or Quizzes section
2. Prepare your file in the specified format (templates available)
3. Upload and validate
4. Review imported items before confirmation

### Study Mode

- **Flashcards**: Flip cards to reveal answers and track your progress
- **Quizzes**: Take timed quizzes and receive instant feedback
- **Review**: Study past attempts with explanations

## 📝 CSV Import Format

### Flashcards
```
Front Question,Back Answer
What is React?,A JavaScript library for building UIs
What is JSX?,JavaScript XML syntax extension
```

### Quizzes
```
Question,Option1,Option2,Option3,Option4,CorrectAnswer(0-3)
What is React?,A library,A framework,A database,A server,0
Which hook for state?,useState,useEffect,useContext,useReducer,0
```

Supports separators: comma (,), pipe (|), or tab

## 🔄 API Endpoints

### Topics
- `GET /api/topics` - List all topics
- `POST /api/topics` - Create topic
- `GET /api/topics/[id]` - Get topic details
- `PATCH /api/topics/[id]` - Update topic
- `DELETE /api/topics/[id]` - Delete topic

### Flashcards
- `GET /api/flashcards?topicId=[id]` - List flashcards
- `POST /api/flashcards` - Create flashcard
- `POST /api/flashcards/import` - Bulk import flashcards
- `PATCH /api/flashcards/[id]` - Update flashcard
- `DELETE /api/flashcards/[id]` - Delete flashcard

### Quizzes
- `GET /api/quizzes?topicId=[id]` - List quizzes
- `POST /api/quizzes` - Create quiz
- `POST /api/quizzes/import` - Bulk import quizzes
- `POST /api/quizzes/[id]/submit` - Submit quiz answers
- `PATCH /api/quizzes/[id]` - Update quiz
- `DELETE /api/quizzes/[id]` - Delete quiz

## 📦 Building for Production

```bash
npm run build
npm run start
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests to improve the project.
