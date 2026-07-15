import { Model } from 'mongoose';
import { ITopicDocument } from '../common/schemas/topic.schema';
import { IUserDocument } from '../common/schemas/user.schema';
export declare class PublicService {
    private topicModel;
    private userModel;
    constructor(topicModel: Model<ITopicDocument>, userModel: Model<IUserDocument>);
    getPublicTopics(page?: number, limit?: number): Promise<{
        data: {
            shareId: any;
            name: any;
            description: any;
            tags: any;
            stats: {
                notesCount: any;
                flashcardsCount: any;
                quizzesCount: any;
            };
            authorName: any;
            createdAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getPublicTopicByShareId(shareId: string): Promise<import("mongoose").Document<unknown, {}, ITopicDocument, {}, import("mongoose").DefaultSchemaOptions> & ITopicDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
