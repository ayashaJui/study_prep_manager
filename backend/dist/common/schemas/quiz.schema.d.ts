import mongoose, { Document, Schema, Model } from 'mongoose';
export interface IQuizQuestion {
    id: string;
    kind?: 'multiple-choice' | 'true-false' | 'short-answer';
    question: string;
    options: string[];
    correctAnswer: number | number[] | string;
    explanation?: string;
    points: number;
    tags: string[];
}
export interface IQuizAttempt {
    attemptId: mongoose.Types.ObjectId;
    date: Date;
    score: number;
    totalPoints: number;
    timeTaken: number;
    answers: {
        questionId: string;
        selectedAnswer: number;
        isCorrect: boolean;
        pointsEarned: number;
    }[];
}
export interface IQuiz {
    topicId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    source?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'multiple-choice' | 'true-false' | 'mixed' | 'short-answer';
    timeLimit?: number;
    tags: string[];
    questions: IQuizQuestion[];
    importSource?: {
        importType?: string;
        fileName?: string;
        importedAt?: Date;
        originalFormat?: string;
    };
    attempts: IQuizAttempt[];
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showAnswersImmediately: boolean;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IQuizDocument extends IQuiz, Document {
    lastScore: string | null;
    lastAttemptDate: string | null;
    attemptsCount: number;
}
export type IQuizModel = Model<IQuizDocument>;
export declare const QuizSchema: Schema;
export declare const QUIZ_MODEL = "Quiz";
