import { TopicsService } from './topics.service';
export declare class TopicsController {
    private readonly topicsService;
    constructor(topicsService: TopicsService);
    getAll(userId: string, parentId?: string, favorite?: string): Promise<(import("mongoose").Document<unknown, {}, import("../common/schemas/topic.schema").ITopicDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/topic.schema").ITopicDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getBySlug(slug: string, userId: string, parentId?: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/topic.schema").ITopicDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/topic.schema").ITopicDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getById(id: string, userId: string): Promise<import("../common/schemas/topic.schema").ITopicDocument>;
    create(body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/topic.schema").ITopicDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/topic.schema").ITopicDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, body: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/topic.schema").ITopicDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/topic.schema").ITopicDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string, recursive?: string): Promise<import("mongoose").Document<unknown, {}, import("../common/schemas/topic.schema").ITopicDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../common/schemas/topic.schema").ITopicDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    publish(id: string, userId: string): Promise<{
        shareId: string;
        publicUrl: string;
    }>;
    unpublish(id: string, userId: string): Promise<any>;
}
