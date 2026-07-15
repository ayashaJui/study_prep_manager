import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IProblemDocument } from '../common/schemas/problem.schema';
export declare class ProblemsService {
    private problemModel;
    constructor(problemModel: Model<IProblemDocument>);
    getAll(userId: string, filters: {
        topicId?: string;
        status?: string;
        difficulty?: string;
        platform?: string;
        tag?: string;
        due?: boolean;
    }): Promise<(mongoose.Document<unknown, {}, IProblemDocument, {}, mongoose.DefaultSchemaOptions> & IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getById(id: string, userId: string): Promise<mongoose.Document<unknown, {}, IProblemDocument, {}, mongoose.DefaultSchemaOptions> & IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(userId: string, data: any): Promise<mongoose.Document<unknown, {}, IProblemDocument, {}, mongoose.DefaultSchemaOptions> & IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, userId: string, data: any): Promise<mongoose.Document<unknown, {}, IProblemDocument, {}, mongoose.DefaultSchemaOptions> & IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string): Promise<any>;
    review(id: string, userId: string, confidence: 'easy' | 'medium' | 'hard' | 'again'): Promise<mongoose.Document<unknown, {}, IProblemDocument, {}, mongoose.DefaultSchemaOptions> & IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
