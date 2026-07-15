import mongoose, { Document, Model } from 'mongoose';
export interface ITopicStats {
    notesCount: number;
    flashcardsCount: number;
    quizzesCount: number;
    completionPercentage: number;
}
export interface ITopic {
    name: string;
    slug: string;
    description?: string;
    parentId?: mongoose.Types.ObjectId;
    level: number;
    path: mongoose.Types.ObjectId[];
    status: 'not-started' | 'in-progress' | 'review' | 'mastered';
    tags: string[];
    favorite: boolean;
    isPublic?: boolean;
    shareId?: string | null;
    lastReviewed?: Date;
    stats: ITopicStats;
    userId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface ITopicDocument extends ITopic, Document {
    progress: number;
}
export type ITopicModel = Model<ITopicDocument>;
export declare const TopicSchema: mongoose.Schema<ITopicDocument, ITopicModel, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    createdAt?: mongoose.SchemaDefinitionProperty<Date, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    updatedAt?: mongoose.SchemaDefinitionProperty<Date, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    name?: mongoose.SchemaDefinitionProperty<string, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    description?: mongoose.SchemaDefinitionProperty<string, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    path?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId[], ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    userId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    progress?: mongoose.SchemaDefinitionProperty<number, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    slug?: mongoose.SchemaDefinitionProperty<string, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    parentId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    level?: mongoose.SchemaDefinitionProperty<number, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: mongoose.SchemaDefinitionProperty<"not-started" | "in-progress" | "review" | "mastered", ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    tags?: mongoose.SchemaDefinitionProperty<string[], ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    favorite?: mongoose.SchemaDefinitionProperty<boolean, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    isPublic?: mongoose.SchemaDefinitionProperty<boolean, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    shareId?: mongoose.SchemaDefinitionProperty<string, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    lastReviewed?: mongoose.SchemaDefinitionProperty<Date, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    stats?: mongoose.SchemaDefinitionProperty<ITopicStats, ITopicDocument, mongoose.Document<unknown, {}, ITopicDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITopicDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
}, ITopicDocument>;
export declare const TOPIC_MODEL = "Topic";
