import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IQuizDocument } from '../common/schemas/quiz.schema';
import { ITopicDocument } from '../common/schemas/topic.schema';
import { IStudySessionDocument } from '../common/schemas/study-session.schema';
export declare class QuizzesService {
    private quizModel;
    private topicModel;
    private sessionModel;
    constructor(quizModel: Model<IQuizDocument>, topicModel: Model<ITopicDocument>, sessionModel: Model<IStudySessionDocument>);
    getAll(userId: string, topicId: string): Promise<(mongoose.Document<unknown, {}, IQuizDocument, {}, mongoose.DefaultSchemaOptions> & IQuizDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getById(id: string, userId: string): Promise<mongoose.Document<unknown, {}, IQuizDocument, {}, mongoose.DefaultSchemaOptions> & IQuizDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(userId: string, data: any): Promise<mongoose.Document<unknown, {}, IQuizDocument, {}, mongoose.DefaultSchemaOptions> & IQuizDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, userId: string, data: any): Promise<mongoose.Document<unknown, {}, IQuizDocument, {}, mongoose.DefaultSchemaOptions> & IQuizDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string): Promise<any>;
    submit(id: string, userId: string, answers: {
        questionId: string;
        selectedAnswer: number | number[] | null;
    }[], timeTaken: number): Promise<{
        score: number;
        totalPoints: number;
    }>;
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
    importBulk(userId: string, topicId: string, quizzes: any[]): Promise<(Omit<mongoose.Document<unknown, {}, IQuizDocument, {}, mongoose.DefaultSchemaOptions> & IQuizDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, string | number | symbol> & Omit<any, "_id">)[]>;
}
