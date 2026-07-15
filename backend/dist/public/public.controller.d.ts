import { Response } from 'express';
import { PublicService } from './public.service';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    getAll(res: Response, page?: string, limit?: string): Promise<void>;
    getByShareId(shareId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/topic.schema").ITopicDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/topic.schema").ITopicDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
