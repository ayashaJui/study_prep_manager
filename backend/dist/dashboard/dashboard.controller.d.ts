import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
    getActivity(userId: string, limit?: string): Promise<{
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
        metric: "flashcards" | "quizzes" | "topics" | "notes";
        goal: any;
        current: number;
        total: any;
    }[]>;
    updateGoals(userId: string, body: {
        goals: any[];
    }): Promise<{
        metric: "flashcards" | "quizzes" | "topics" | "notes";
        label: string;
        target: number;
    }[]>;
}
