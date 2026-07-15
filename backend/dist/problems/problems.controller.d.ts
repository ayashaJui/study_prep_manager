import { ProblemsService } from './problems.service';
export declare class ProblemsController {
    private readonly problemsService;
    constructor(problemsService: ProblemsService);
    getAll(userId: string, topicId?: string, status?: string, difficulty?: string, platform?: string, tag?: string, due?: string): Promise<(import("mongoose").Document<unknown, {}, import("../common/schemas/problem.schema").IProblemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/problem.schema").IProblemDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getById(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/problem.schema").IProblemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/problem.schema").IProblemDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/problem.schema").IProblemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/problem.schema").IProblemDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    review(id: string, body: {
        confidence: 'easy' | 'medium' | 'hard' | 'again';
    }, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/problem.schema").IProblemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/problem.schema").IProblemDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/problem.schema").IProblemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/problem.schema").IProblemDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string): Promise<any>;
}
