import { Response } from 'express';
import { StudySessionsService } from './study-sessions.service';
export declare class StudySessionsController {
    private readonly studySessionsService;
    constructor(studySessionsService: StudySessionsService);
    getStreak(userId: string, tz?: string): Promise<{
        streak: number;
        lastStudyDate: string;
    }>;
    getHistory(userId: string, res: Response, limit?: string, page?: string): Promise<void>;
    create(body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/study-session.schema").IStudySessionDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/study-session.schema").IStudySessionDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
