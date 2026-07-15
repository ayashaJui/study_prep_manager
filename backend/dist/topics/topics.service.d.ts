import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { ITopicDocument } from '../common/schemas/topic.schema';
import { INoteDocument } from '../common/schemas/note.schema';
import { IFlashcardDocument } from '../common/schemas/flashcard.schema';
import { IQuizDocument } from '../common/schemas/quiz.schema';
export declare class TopicsService {
    private topicModel;
    private noteModel;
    private flashcardModel;
    private quizModel;
    constructor(topicModel: Model<ITopicDocument>, noteModel: Model<INoteDocument>, flashcardModel: Model<IFlashcardDocument>, quizModel: Model<IQuizDocument>);
    getAll(userId: string, parentId?: string, favorite?: boolean): Promise<(mongoose.Document<unknown, {}, ITopicDocument, {}, mongoose.DefaultSchemaOptions> & ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getById(id: string, userId: string): Promise<ITopicDocument>;
    getBySlug(slug: string, userId: string, parentId?: string): Promise<mongoose.Document<unknown, {}, ITopicDocument, {}, mongoose.DefaultSchemaOptions> & ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(data: {
        name: string;
        description?: string;
        parentId?: string;
        level?: number;
        path?: string[];
        status?: string;
        tags?: string[];
        favorite?: boolean;
        userId: string;
    }): Promise<mongoose.Document<unknown, {}, ITopicDocument, {}, mongoose.DefaultSchemaOptions> & ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, userId: string, data: {
        name?: string;
        description?: string;
        status?: string;
        tags?: string[];
        favorite?: boolean;
    }): Promise<mongoose.Document<unknown, {}, ITopicDocument, {}, mongoose.DefaultSchemaOptions> & ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string, recursive?: boolean): Promise<mongoose.Document<unknown, {}, ITopicDocument, {}, mongoose.DefaultSchemaOptions> & ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
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
