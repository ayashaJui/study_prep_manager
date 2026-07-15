import { Model } from 'mongoose';
import { ITopicDocument } from '../common/schemas/topic.schema';
import { INoteDocument } from '../common/schemas/note.schema';
import { IFlashcardDocument } from '../common/schemas/flashcard.schema';
import { IQuizDocument } from '../common/schemas/quiz.schema';
import { IStudySessionDocument } from '../common/schemas/study-session.schema';
import { IUserDocument } from '../common/schemas/user.schema';
type WeeklyGoalMetric = 'flashcards' | 'quizzes' | 'topics' | 'notes';
export declare class DashboardService {
    private topicModel;
    private noteModel;
    private flashcardModel;
    private quizModel;
    private sessionModel;
    private userModel;
    constructor(topicModel: Model<ITopicDocument>, noteModel: Model<INoteDocument>, flashcardModel: Model<IFlashcardDocument>, quizModel: Model<IQuizDocument>, sessionModel: Model<IStudySessionDocument>, userModel: Model<IUserDocument>);
    getStats(userId: string): Promise<{
        totalTopics: number;
        totalFlashcards: number;
        totalQuizzes: number;
        averageScore: number;
        weeklyStats: {
            flashcardsReviewed: number;
            quizzesTaken: number;
            notesCreated: number;
            studyTime: number;
        };
    }>;
    getActivity(userId: string, limit?: number): Promise<{
        id: import("mongoose").Types.ObjectId;
        action: string;
        topic: any;
        time: string;
    }[]>;
    getProgress(userId: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        status: "not-started" | "in-progress" | "review" | "mastered";
        progress: number;
    }[]>;
    getGoals(userId: string): Promise<{
        metric: WeeklyGoalMetric;
        goal: any;
        current: number;
        total: any;
    }[]>;
    updateGoals(userId: string, goals: {
        metric: WeeklyGoalMetric;
        label: string;
        target: number;
    }[]): Promise<{
        metric: WeeklyGoalMetric;
        label: string;
        target: number;
    }[]>;
}
export {};
