import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { INoteDocument } from '../common/schemas/note.schema';
import { ITopicDocument } from '../common/schemas/topic.schema';
export declare class NotesService {
    private noteModel;
    private topicModel;
    constructor(noteModel: Model<INoteDocument>, topicModel: Model<ITopicDocument>);
    getAll(userId: string, topicId: string): Promise<(mongoose.Document<unknown, {}, INoteDocument, {}, mongoose.DefaultSchemaOptions> & INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPinned(userId: string): Promise<(mongoose.Document<unknown, {}, INoteDocument, {}, mongoose.DefaultSchemaOptions> & INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getById(id: string, userId: string): Promise<mongoose.Document<unknown, {}, INoteDocument, {}, mongoose.DefaultSchemaOptions> & INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(userId: string, data: {
        topicId: string;
        content: string;
        tags?: string[];
        pinned?: boolean;
    }): Promise<mongoose.Document<unknown, {}, INoteDocument, {}, mongoose.DefaultSchemaOptions> & INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, userId: string, data: Partial<{
        content: string;
        tags: string[];
        pinned: boolean;
    }>): Promise<mongoose.Document<unknown, {}, INoteDocument, {}, mongoose.DefaultSchemaOptions> & INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string): Promise<any>;
}
