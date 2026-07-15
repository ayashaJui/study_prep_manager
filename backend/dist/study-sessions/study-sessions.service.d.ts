import { Model } from 'mongoose';
import { IStudySessionDocument } from '../common/schemas/study-session.schema';
export declare class StudySessionsService {
    private sessionModel;
    constructor(sessionModel: Model<IStudySessionDocument>);
    create(userId: string, data: {
        topicId?: string;
        activityType: string;
        duration: number;
        score?: number;
    }): Promise<import("mongoose").Document<unknown, {}, IStudySessionDocument, {}, import("mongoose").DefaultSchemaOptions> & IStudySessionDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getHistory(userId: string, limit?: number, page?: number): Promise<{
        sessions: (import("mongoose").Document<unknown, {}, IStudySessionDocument, {}, import("mongoose").DefaultSchemaOptions> & IStudySessionDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStreak(userId: string, tz?: string): Promise<{
        streak: number;
        lastStudyDate: string;
    }>;
}
