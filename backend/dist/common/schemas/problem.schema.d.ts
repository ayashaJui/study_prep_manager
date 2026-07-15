import mongoose, { Document, Model } from 'mongoose';
export interface IProblem {
    userId: mongoose.Types.ObjectId;
    topicId?: mongoose.Types.ObjectId | null;
    title: string;
    platform: string;
    problemNumber?: string;
    url?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    status: 'unsolved' | 'attempted' | 'solved';
    tags: string[];
    notes?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    language?: string;
    nextReview?: Date;
    reviewInterval?: number;
    reviewCount: number;
    lastReviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IProblemDocument extends IProblem, Document {
}
export type IProblemModel = Model<IProblemDocument>;
export declare const ProblemSchema: mongoose.Schema<IProblemDocument, IProblemModel, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, {
    notes?: mongoose.SchemaDefinitionProperty<string, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    _id?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    createdAt?: mongoose.SchemaDefinitionProperty<Date, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    updatedAt?: mongoose.SchemaDefinitionProperty<Date, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    userId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    url?: mongoose.SchemaDefinitionProperty<string, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: mongoose.SchemaDefinitionProperty<"unsolved" | "attempted" | "solved", IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    tags?: mongoose.SchemaDefinitionProperty<string[], IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    topicId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    difficulty?: mongoose.SchemaDefinitionProperty<"easy" | "medium" | "hard", IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    nextReview?: mongoose.SchemaDefinitionProperty<Date, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    reviewCount?: mongoose.SchemaDefinitionProperty<number, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    title?: mongoose.SchemaDefinitionProperty<string, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    platform?: mongoose.SchemaDefinitionProperty<string, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    problemNumber?: mongoose.SchemaDefinitionProperty<string, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    timeComplexity?: mongoose.SchemaDefinitionProperty<string, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    spaceComplexity?: mongoose.SchemaDefinitionProperty<string, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    language?: mongoose.SchemaDefinitionProperty<string, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    reviewInterval?: mongoose.SchemaDefinitionProperty<number, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    lastReviewedAt?: mongoose.SchemaDefinitionProperty<Date, IProblemDocument, mongoose.Document<unknown, {}, IProblemDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProblemDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
}, IProblemDocument>;
export declare const PROBLEM_MODEL = "Problem";
