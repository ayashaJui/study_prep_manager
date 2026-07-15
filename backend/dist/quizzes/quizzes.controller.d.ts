import { QuizzesService } from './quizzes.service';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
    getAnalytics(userId: string, topicId: string): Promise<{
        summary: {
            totalQuizzes: number;
            quizzesAttempted: number;
            totalAttempts: number;
            avgScore: number;
            bestScore: number;
        };
        quizzes: any[];
    }>;
    getAll(userId: string, topicId: string): Promise<(import("mongoose").Document<unknown, {}, import("../common/schemas/quiz.schema").IQuizDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/quiz.schema").IQuizDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getById(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/quiz.schema").IQuizDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/quiz.schema").IQuizDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/quiz.schema").IQuizDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/quiz.schema").IQuizDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    importBulk(body: {
        topicId: string;
        quizzes: any[];
    }, userId: string): Promise<(Omit<import("mongoose").Document<unknown, {}, import("../common/schemas/quiz.schema").IQuizDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/quiz.schema").IQuizDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, string | number | symbol> & Omit<any, "_id">)[]>;
    submit(id: string, body: {
        answers: any[];
        timeTaken: number;
    }, userId: string): Promise<{
        score: number;
        totalPoints: number;
    }>;
    update(id: string, body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/quiz.schema").IQuizDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/quiz.schema").IQuizDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string): Promise<any>;
}
