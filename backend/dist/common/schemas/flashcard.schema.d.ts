import mongoose, { Document, Model } from 'mongoose';
export interface IFlashcard {
    topicId: mongoose.Types.ObjectId;
    front: string;
    back: string;
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    status: 'new' | 'learning' | 'review' | 'mastered';
    confidence: 'easy' | 'medium' | 'hard';
    lastReviewed?: Date;
    nextReview?: Date;
    easeFactor?: number;
    intervalDays?: number;
    reviewCount: number;
    importSource?: {
        type?: string;
        fileName?: string;
        importedAt?: Date;
        batchId?: string;
    };
    userId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IFlashcardDocument extends IFlashcard, Document {
}
export type IFlashcardModel = Model<IFlashcardDocument>;
export declare const FlashcardSchema: mongoose.Schema<IFlashcardDocument, IFlashcardModel, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    createdAt?: mongoose.SchemaDefinitionProperty<Date, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    updatedAt?: mongoose.SchemaDefinitionProperty<Date, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    userId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: mongoose.SchemaDefinitionProperty<"new" | "review" | "mastered" | "learning", IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    tags?: mongoose.SchemaDefinitionProperty<string[], IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    lastReviewed?: mongoose.SchemaDefinitionProperty<Date, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    topicId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    front?: mongoose.SchemaDefinitionProperty<string, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    back?: mongoose.SchemaDefinitionProperty<string, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    difficulty?: mongoose.SchemaDefinitionProperty<"easy" | "medium" | "hard", IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    confidence?: mongoose.SchemaDefinitionProperty<"easy" | "medium" | "hard", IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    nextReview?: mongoose.SchemaDefinitionProperty<Date, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    easeFactor?: mongoose.SchemaDefinitionProperty<number, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    intervalDays?: mongoose.SchemaDefinitionProperty<number, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    reviewCount?: mongoose.SchemaDefinitionProperty<number, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    importSource?: mongoose.SchemaDefinitionProperty<{
        type?: string;
        fileName?: string;
        importedAt?: Date;
        batchId?: string;
    }, IFlashcardDocument, mongoose.Document<unknown, {}, IFlashcardDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IFlashcardDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
}, IFlashcardDocument>;
export declare const FLASHCARD_MODEL = "Flashcard";
