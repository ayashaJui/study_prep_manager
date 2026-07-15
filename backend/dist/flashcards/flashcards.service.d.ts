import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IFlashcardDocument } from '../common/schemas/flashcard.schema';
import { ITopicDocument } from '../common/schemas/topic.schema';
export declare class FlashcardsService {
    private flashcardModel;
    private topicModel;
    constructor(flashcardModel: Model<IFlashcardDocument>, topicModel: Model<ITopicDocument>);
    getAll(userId: string, topicId?: string): Promise<(mongoose.Document<unknown, {}, IFlashcardDocument, {}, mongoose.DefaultSchemaOptions> & IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[] | mongoose.PopulateDocumentResult<mongoose.Document<unknown, {}, IFlashcardDocument, {}, mongoose.DefaultSchemaOptions> & IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {
        topicId: {
            _id: mongoose.Types.ObjectId;
            name: string;
        } | null;
    }, Omit<IFlashcardDocument, "topicId"> & {
        topicId: {
            _id: mongoose.Types.ObjectId;
            name: string;
        } | null;
    }, IFlashcardDocument>[]>;
    getById(id: string, userId: string): Promise<mongoose.Document<unknown, {}, IFlashcardDocument, {}, mongoose.DefaultSchemaOptions> & IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(userId: string, data: {
        topicId: string;
        front: string;
        back: string;
        tags?: string[];
        difficulty?: string;
    }): Promise<mongoose.Document<unknown, {}, IFlashcardDocument, {}, mongoose.DefaultSchemaOptions> & IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, userId: string, data: any): Promise<mongoose.Document<unknown, {}, IFlashcardDocument, {}, mongoose.DefaultSchemaOptions> & IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, userId: string): Promise<any>;
    review(id: string, userId: string, quality: number): Promise<mongoose.Document<unknown, {}, IFlashcardDocument, {}, mongoose.DefaultSchemaOptions> & IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    importBulk(userId: string, topicId: string, flashcards: any[]): Promise<(Omit<mongoose.Document<unknown, {}, IFlashcardDocument, {}, mongoose.DefaultSchemaOptions> & IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, string | number | symbol> & Omit<any, "_id">)[]>;
}
